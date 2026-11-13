// Compresses banner images that were uploaded before upload-time compression
// existed: product banners and home slider images.
//
//   node --env-file=.env.local scripts/compress-banners.mjs            # dry run
//   node --env-file=.env.local scripts/compress-banners.mjs --apply    # do it
//
// Options: --min-kb=300            only touch images larger than this (default 300)
//          --only=sliders|products limit to one kind (default both)
//
// Safe by design: the default is a dry run that only reads. With --apply, each
// image is re-uploaded as a NEW Cloudinary asset ("<id>-compressed") and the
// document is pointed at it. The original asset is never deleted or
// overwritten, so you can roll back by restoring the old URL from the backup
// file.
import dns from "node:dns";
import { writeFileSync } from "node:fs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const minKb = Number(args.find((a) => a.startsWith("--min-kb="))?.split("=")[1] ?? 300);
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const MAX_SIDE = 1600;

for (const key of ["MONGO_URI", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
  if (!process.env[key]) {
    console.error(`${key} is not set (run with --env-file=.env.local)`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg -> folder/name
const extractPublicId = (url) => {
  const parts = url.split("/");
  const i = parts.indexOf("upload");
  if (i === -1 || i >= parts.length - 2) return null;
  return parts.slice(i + 2).join("/").replace(/\.[^/.]+$/, "");
};

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const backup = [];
let savedBytes = 0;
let changed = 0;

// Returns the new URL when the image was re-uploaded and is worth switching
// to, otherwise null. Logs what it did.
const processImage = async (label, url) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    console.log(`skip   ${label}: not a Cloudinary URL`);
    return null;
  }
  const publicId = extractPublicId(url);
  if (!publicId) {
    console.log(`skip   ${label}: cannot read public id`);
    return null;
  }
  if (publicId.endsWith("-compressed")) {
    console.log(`skip   ${label}: already compressed`);
    return null;
  }

  let info;
  try {
    info = await cloudinary.api.resource(publicId, { resource_type: "image" });
  } catch (error) {
    console.log(`skip   ${label}: lookup failed (${error?.error?.message ?? error.message})`);
    return null;
  }

  if (["gif", "svg"].includes(info.format)) {
    console.log(`skip   ${label}: ${info.format} left alone`);
    return null;
  }
  const tooBig = info.bytes > minKb * 1024 || Math.max(info.width, info.height) > MAX_SIDE;
  if (!tooBig) {
    console.log(`ok     ${label}: ${kb(info.bytes)} ${info.width}x${info.height}`);
    return null;
  }
  if (!apply) {
    console.log(`would  ${label}: ${kb(info.bytes)} ${info.width}x${info.height}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(info.secure_url, {
      public_id: `${publicId}-compressed`,
      overwrite: false,
      resource_type: "image",
      transformation: [
        { width: MAX_SIDE, height: MAX_SIDE, crop: "limit" },
        { quality: "auto:good" },
      ],
    });

    if (result.bytes >= info.bytes * 0.9) {
      console.log(`keep   ${label}: only ${kb(info.bytes)} -> ${kb(result.bytes)}, not worth switching`);
      return null;
    }

    savedBytes += info.bytes - result.bytes;
    changed++;
    console.log(`done   ${label}: ${kb(info.bytes)} -> ${kb(result.bytes)}`);
    return result.secure_url;
  } catch (error) {
    console.log(`FAIL   ${label}: ${error?.error?.message ?? error.message}`);
    return null;
  }
};

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
console.log(`${apply ? "APPLY" : "DRY RUN"}: threshold ${minKb} KB\n`);

if (only !== "sliders") {
  const products = mongoose.connection.collection("products");
  const docs = await products
    .find({ banner: { $exists: true, $ne: "" }, bannerType: { $in: [null, "image"] } })
    .project({ name: 1, banner: 1 })
    .toArray();
  console.log(`Product banners: ${docs.length}`);

  for (const doc of docs) {
    const next = await processImage(`product ${doc.name} (${doc._id})`, doc.banner);
    if (!next) continue;
    await products.updateOne({ _id: doc._id }, { $set: { banner: next } });
    backup.push({ collection: "products", _id: String(doc._id), field: "banner", oldUrl: doc.banner, newUrl: next });
  }
  console.log("");
}

if (only !== "products") {
  const sliders = mongoose.connection.collection("sliders");
  const docs = await sliders.find({}).project({ title: 1, images: 1 }).toArray();
  console.log(`Home sliders: ${docs.length}`);

  for (const doc of docs) {
    for (const [i, image] of (doc.images ?? []).entries()) {
      const next = await processImage(`slider "${doc.title}" image ${i + 1}`, image?.url);
      if (!next) continue;
      await sliders.updateOne({ _id: doc._id }, { $set: { [`images.${i}.url`]: next } });
      backup.push({ collection: "sliders", _id: String(doc._id), field: `images.${i}.url`, oldUrl: image.url, newUrl: next });
    }
  }
  console.log("");
}

if (apply && backup.length) {
  const file = `banner-backup-${Date.now()}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`Backup of old URLs written to ${file}`);
}
console.log(apply ? `Updated ${changed} image(s), saved ${kb(savedBytes)}.` : "Dry run only, nothing changed. Re-run with --apply to compress.");

await mongoose.disconnect();
