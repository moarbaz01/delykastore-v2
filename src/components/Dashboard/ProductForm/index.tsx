"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Plus as Add, Trash2 as Delete, Upload } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface CostItem {
  id: string;
  amount?: string;
  durationDays?: string | number;
  price: string;
  note?: string;
  category?: string;
  image?: File | string | null;
}

interface Product {
  _id?: string;
  type?: string;
  name: string;
  description: string;
  isApi: boolean;
  isLink?: boolean;
  link?: string;
  region: string;
  game: string;
  apiName: string;
  requiresServerId?: boolean;
  requiresUserId?: boolean;
  requiresCharName?: boolean;
  requiresUrlInput?: boolean;
  urlInputLabel?: string;
  slides: (string | File)[];
  banner: string | File;
  image: string | File | null;
  isDeleted: boolean;
  cost: CostItem[];
  stock: boolean;
  spinActive: boolean;
  spinCostIds: string[];
  isTesting: boolean;
}

const ProductForm = ({ product }: { product?: Product }) => {
  const [formData, setFormData] = useState<Product>({
    _id: product?._id || "",
    type: product?.type || "topup",
    name: product?.name || "",
    description: product?.description || "",
    isApi: product?.isApi || false,
    isLink: product?.isLink || false,
    link: product?.link || "",
    region: product?.region || "",
    game: product?.game || "",
    apiName: product?.apiName || "",
    requiresServerId: product?.requiresServerId || false,
    requiresUserId: product?.requiresUserId || false,
    requiresCharName: product?.requiresCharName || false,
    requiresUrlInput: product?.requiresUrlInput || false,
    urlInputLabel: product?.urlInputLabel || "",
    image: product?.image || null,
    isDeleted: product?.isDeleted || false,
    cost: product?.cost || [
      {
        id: "",
        amount: "",
        price: "",
        category: "no_category",
        note: "",
        image: null,
      },
    ],
    slides: product?.slides || [],
    banner: product?.banner || "",
    stock: product?.stock || false,
    spinActive: product?.spinActive || false,
    spinCostIds: product?.spinCostIds || [],
    isTesting: product?.isTesting || false,
  });

  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>(
    {}
  );
  const [imagePreview, setImagePreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [slidePreviews, setSlidePreviews] = useState<string[]>([]);
  const loadingRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [costCategories, setCostCategories] = useState<
    { name: string; _id: string, type: string }[]
  >([]);

  const { data: aluuGamesData, isLoading: isAluuGamesLoading } = useQuery({
    queryKey: ["aluu-games"],
    queryFn: async () => {
      const response = await axios.get("/api/aluu/games");
      return response.data?.data as { Name: string; gamecode: string }[];
    },
    enabled: formData.apiName === "Aluu Api",
  });

  // Initialize previews from existing data
  useEffect(() => {
    if (product) {
      if (product.banner && typeof product.banner === "string") {
        setBannerPreview(product.banner);
      }
      if (product.slides && product.slides.length > 0) {
        const existingSlidePreviews = product.slides.filter(
          (slide) => typeof slide === "string"
        ) as string[];
        setSlidePreviews(existingSlidePreviews);
      }
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSpinCostChange = (costId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      spinCostIds: checked
        ? [...prev.spinCostIds, costId]
        : prev.spinCostIds.filter((id) => id !== costId),
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;

    if (name) {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        // Reset fields when type changes
        if (name === "type") {
          if (value === "account") {
            newData.isApi = false;
            newData.game = "Custom Game";
          } else {
            newData.game = "";
          }
        }
        return newData;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
  };

  // Banner upload handler
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, banner: file }));
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleRemoveBanner = () => {
    setFormData((prev) => ({ ...prev, banner: "" }));
    setBannerPreview("");
  };

  // Slides upload handler
  const handleSlidesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newSlides = [...formData.slides, ...files];
      setFormData((prev) => ({ ...prev, slides: newSlides }));

      // Create previews for new files
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setSlidePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveSlide = (index: number) => {
    const newSlides = [...formData.slides];
    const newPreviews = [...slidePreviews];

    // Revoke object URL if it's a file
    if (typeof newSlides[index] !== "string") {
      URL.revokeObjectURL(newPreviews[index]);
    }

    newSlides.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData((prev) => ({ ...prev, slides: newSlides }));
    setSlidePreviews(newPreviews);
  };

  const handleCostImageUpload = (index: number, file: File) => {
    setFormData((prev) => {
      const updatedCosts = [...prev.cost];
      updatedCosts[index].image = file;
      return { ...prev, cost: updatedCosts };
    });

    const url = URL.createObjectURL(file);
    setImagePreviews((prev) => ({ ...prev, [index]: url }));
  };

  const handleCostImageRemove = (index: number) => {
    setFormData((prev) => {
      const updatedCosts = [...prev.cost];
      updatedCosts[index].image = null;
      return { ...prev, cost: updatedCosts };
    });

    setImagePreviews((prev) => ({ ...prev, [index]: "" }));
  };

  // Cost item handling
  const handleCostChange = (index: number, field: string, value: string) => {
    const updatedCosts = [...formData.cost];
    updatedCosts[index][field as keyof CostItem] = value;
    setFormData((prev) => ({ ...prev, cost: updatedCosts }));
  };

  const handleAddCost = () => {
    setFormData((prev) => ({
      ...prev,
      cost: [
        ...prev.cost,
        { id: "", amount: "", price: "", category: "", note: "", image: null },
      ],
    }));
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim() !== "");
      if (lines.length <= 1) {
        toast.error("CSV is empty or invalid");
        return;
      }

      const newCosts: CostItem[] = [];

      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        // Split by comma but ignore commas inside quotes, preserving empty columns
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const cleanRow = row.map((item) => item.replace(/(^"|"$)/g, "").trim());

        if (cleanRow.length >= 3) {
          const id = cleanRow[0] || "";
          const amount = cleanRow[1] || "";
          const price = cleanRow[2] || "";
          const note = cleanRow[3] || "";
          const category = cleanRow[4] || "no_category";

          if (id && price) {
            newCosts.push({
              id,
              amount,
              price,
              category,
              note,
              image: null
            });
          }
        }
      }

      if (newCosts.length > 0) {
        setFormData((prev) => ({
          ...prev,
          cost: [...prev.cost, ...newCosts]
        }));
        toast.success(`Imported ${newCosts.length} items successfully!`);
      } else {
        toast.error("No valid items found to import (missing ID or Price)");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input so the same file can be uploaded again
  };

  const handleRemoveCost = (index: number) => {
    const updatedCosts = [...formData.cost];
    updatedCosts.splice(index, 1);
    setFormData((prev) => ({ ...prev, cost: updatedCosts }));
  };

  const fetchCostCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      const categories = response.data;
      setCostCategories(categories);
    } catch (error) {
      console.error("Error fetching cost categories:", error);
      return [];
    }
  };

  const handleUploadImage = async (file: File, folder: string) => {
    const form = new FormData();
    form.append("image", file);
    form.append("folder", folder);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        const { url } = await response.json();
        return url;
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCostCategories();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    loadingRef.current = toast.loading("Saving product...");
    const endpoint = "/api/product";

    if (formData.isApi) {
      if (!formData.apiName) {
        toast.error("API Name is required for API products.");
        toast.dismiss(loadingRef.current);
        setLoading(false);
        return;
      }

      if (formData.apiName === "Smile One Api" && !formData.region) {
        toast.error("Region is required for API products.");
        toast.dismiss(loadingRef.current);
        setLoading(false);
        return;
      }
    }

    if (!formData.game && formData.type !== "account") {
      toast.error("Game is required.");
      toast.dismiss(loadingRef.current);
      setLoading(false);
      return;
    }
    if (!product && !formData.image) {
      toast.error("Image is required for new products.");
      toast.dismiss(loadingRef.current);
      setLoading(false);
      return;
    }

    const isValid = formData.cost.every(
      (cost) => cost.id && cost.price && (formData.type === "account" ? cost.durationDays : cost.amount)
    );
    if (!isValid) {
      toast.error("Please fill all cost fields with valid values.");
      toast.dismiss(loadingRef.current);
      setLoading(false);
      return;
    }

    // Form data for the request
    const data = new FormData();
    data.append("type", formData.type || "topup");
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("isApi", JSON.stringify(formData.type === "account" ? false : formData.isApi));
    data.append("game", formData.type === "account" ? "Custom Game" : formData.game);
    if (formData.isApi) {
      data.append("apiName", formData.apiName);
      data.append("requiresServerId", String(formData.requiresServerId));
      data.append("requiresUserId", String(formData.requiresUserId));
      data.append("requiresCharName", String(formData.requiresCharName));
      data.append("requiresUrlInput", String(formData.requiresUrlInput));
      if (formData.urlInputLabel) data.append("urlInputLabel", formData.urlInputLabel);
      data.append("isTesting", String(formData.isTesting));
      if (formData.game === "mobilelegends") {
        data.append("region", formData.region);
      } else {
        data.append("region", "");
      }
    }
    if (formData.image) {
      data.append("image", formData.image);
    }
    data.append("isDeleted", JSON.stringify(formData.isDeleted));
    data.append("stock", formData.stock.toString());
    data.append("spinActive", formData.spinActive.toString());
    data.append("spinCostIds", JSON.stringify(formData.spinCostIds));
    data.append("isTesting", JSON.stringify(formData.isTesting));

    // Upload banner if it's a new file
    if (formData.banner && typeof formData.banner !== "string") {
      try {
        const bannerUrl = await handleUploadImage(formData.banner, "/banners");
        data.append("banner", bannerUrl);
      } catch (error) {
        console.error("Failed to upload banner:", error);
        toast.error("Failed to upload banner");
        toast.dismiss(loadingRef.current);
        setLoading(false);
        return;
      }
    } else if (typeof formData.banner === "string") {
      data.append("banner", formData.banner);
    }

    // Upload slides
    const uploadedSlides: string[] = [];
    if (formData.slides.length > 0) {
      for (let i = 0; i < formData.slides.length; i++) {
        const slide = formData.slides[i];
        if (typeof slide === "string") {
          uploadedSlides.push(slide);
        } else {
          try {
            const slideUrl = await handleUploadImage(slide, "/slides");
            uploadedSlides.push(slideUrl);
          } catch (error) {
            console.error(`Failed to upload slide ${i}:`, error);
            toast.error(`Failed to upload slide ${i + 1}`);
          }
        }
      }
    }
    data.append("slides", JSON.stringify(uploadedSlides));

    // Upload cost item images
    if (formData.cost.length > 0) {
      const uploadPromises = formData.cost.map(async (cost, index) => {
        if (cost.image && typeof cost.image !== "string") {
          try {
            const url = await handleUploadImage(cost.image, "/costImages");
            const updatedCosts = [...formData.cost];
            updatedCosts[index].image = url;
            setFormData((prev) => ({ ...prev, cost: updatedCosts }));
            return url;
          } catch (error) {
            console.error(`Upload failed for cost item ${index}:`, error);
            toast.error(`Failed to upload image for cost item ${index + 1}`);
            return null;
          }
        }
        return null;
      });

      await Promise.allSettled(uploadPromises);
    }

    if (formData.isLink) {
      data.append("cost", "[]");
    } else {
      data.append("cost", JSON.stringify(formData.cost));
    }
    data.append("isLink", formData.isLink ? "true" : "false");
    if (formData.link) {
      data.append("link", formData.link);
    }
    if (product) {
      data.append("id", formData._id);
    }

    try {
      const response = await axios({
        method: product ? "PUT" : "POST",
        url: endpoint,
        data: data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data;
      console.log(result);
      toast.success("Product saved successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to save product");
    } finally {
      toast.dismiss(loadingRef.current);
      setLoading(false);
    }
  };

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">
        {product ? "Edit Product" : "Create Product"}
      </h1>
      <Paper className="p-6 pb-28 relative">
        <form>
          {/* Type Select */}
          <div className="mb-4">
            <label className="block mb-2 text-white font-medium">Product Type</label>
            <Select
              fullWidth
              name="type"
              value={formData.type || "topup"}
              onChange={handleSelectChange}
            >
              <MenuItem value="topup">Top-Up (In-Game Currency)</MenuItem>
              <MenuItem value="account">Premium Account</MenuItem>
            </Select>
          </div>

          {/* Name */}
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
          />

          {/* Is API */}
          {formData.type !== "account" && (
            <FormControlLabel
              control={
                <Checkbox
                  name="isApi"
                  checked={formData.isApi}
                  onChange={handleCheckboxChange}
                />
              }
              label="Is API"
            />
          )}

          {/* API Name (Select) */}
          {formData.type !== "account" && formData.isApi && (
            <>
              <Select
                fullWidth
                name="apiName"
                value={formData.apiName}
                onChange={handleSelectChange}
                displayEmpty
                sx={{ margin: "16px 0" }}
              >
                <MenuItem value="">Select API Name</MenuItem>
                <MenuItem value="Smile One Api">Smile One Api</MenuItem>
                {/* <MenuItem value="Garena Api">Garena Api</MenuItem> */}
                <MenuItem value="TopUp Ghor Api"> Top-Up Ghor Api</MenuItem>
                <MenuItem value="Bangla Api">Bangla Api</MenuItem>
                <MenuItem value="Aluu Api">Aluu Api</MenuItem>
              </Select>
              {(formData.apiName === "Smile One Api" ||
                formData.game === "mobilelegends") && (
                  <Select
                    fullWidth
                    name="region"
                    value={formData.region}
                    onChange={handleSelectChange}
                    displayEmpty
                    sx={{ margin: "16px 0" }}
                  >
                    <MenuItem value="">Select Region</MenuItem>
                    <MenuItem value="brazil">Brazil</MenuItem>
                    <MenuItem value="philippines">Philippines</MenuItem>
                    <MenuItem value="indonesia">Indonesia</MenuItem>
                  </Select>
                )}
            </>
          )}

          {/* Required Fields (Only for ALUU API) */}
          {formData.type !== "account" && formData.isApi && formData.apiName === "Aluu Api" && (
            <div className="mb-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
              <Typography variant="subtitle2" className="text-gray-300 mb-2">
                ALUU API Required Fields
              </Typography>
              <div className="flex flex-col gap-2">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="requiresUserId"
                      checked={formData.requiresUserId}
                      onChange={handleCheckboxChange}
                      sx={{ color: "gray", "&.Mui-checked": { color: "#8b5cf6" } }}
                    />
                  }
                  label="Requires User ID"
                  className="text-gray-300"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="requiresServerId"
                      checked={formData.requiresServerId}
                      onChange={handleCheckboxChange}
                      sx={{ color: "gray", "&.Mui-checked": { color: "#8b5cf6" } }}
                    />
                  }
                  label="Requires Server ID (Zone ID)"
                  className="text-gray-300"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="requiresCharName"
                      checked={formData.requiresCharName}
                      onChange={handleCheckboxChange}
                      sx={{ color: "gray", "&.Mui-checked": { color: "#8b5cf6" } }}
                    />
                  }
                  label="Requires Character Name"
                  className="text-gray-300"
                />
              </div>
            </div>
          )}

          {/* isLink and Link Input (Only for account) */}
          {formData.type === "account" && (
            <div className="mb-4 flex flex-col gap-4">
              <FormControlLabel
                control={
                  <Checkbox
                    name="isLink"
                    checked={formData.isLink}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Is Link (Direct Redirect)"
              />
              {formData.isLink && (
                <TextField
                  fullWidth
                  name="link"
                  label="Direct Link URL"
                  value={formData.link}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                />
              )}
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-3 bg-[#0D0B1A] p-4 rounded-xl border border-purple-500/10 hover:border-primary/50 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="requiresUrlInput"
                      checked={formData.requiresUrlInput}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary focus:ring-offset-gray-800"
                    />
                  </div>
                  <label className="text-sm font-medium text-gray-200 cursor-pointer flex-1">
                    Requires URL/Link Input (e.g. TikTok Profile)
                  </label>
                </div>
                
                {formData.requiresUrlInput && (
                  <div className="bg-[#0D0B1A] p-4 rounded-xl border border-purple-500/10">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      URL Input Label
                    </label>
                    <input
                      type="text"
                      name="urlInputLabel"
                      value={formData.urlInputLabel || ""}
                      onChange={handleChange}
                      placeholder="e.g. Enter TikTok Profile Link"
                      className="w-full bg-[#12102A] text-white rounded-lg px-4 py-2 border border-purple-500/20 focus:border-primary outline-none text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Game */}
          {formData.type !== "account" && formData.apiName === "Aluu Api" ? (
            <Select
              fullWidth
              name="game"
              value={formData.game}
              onChange={handleSelectChange}
              displayEmpty
              sx={{ margin: "16px 0" }}
            >
              <MenuItem value="">Select ALUU Game</MenuItem>
              {isAluuGamesLoading ? (
                <MenuItem disabled>Loading games...</MenuItem>
              ) : (
                aluuGamesData?.map((g) => (
                  <MenuItem key={g.gamecode} value={g.gamecode}>
                    {g.Name} ({g.gamecode})
                  </MenuItem>
                ))
              )}
            </Select>
          ) : formData.type !== "account" && (
            <Select
              fullWidth
              name="game"
              value={formData.game}
              onChange={handleSelectChange}
              displayEmpty
              sx={{ margin: "16px 0" }}
            >
              <MenuItem value="">Select Game</MenuItem>
              <MenuItem value="freefire">Free Fire</MenuItem>
              <MenuItem value="mobilelegends">MLBB</MenuItem>
              <MenuItem value="pubg">PUBG Global</MenuItem>
              <MenuItem value="honorofkings">Honor Of Kings</MenuItem>
              <MenuItem value="magicchess">Magic Chess</MenuItem>
              <MenuItem value="bloodstrike">Blood Strike</MenuItem>
              <MenuItem value="genshinimpact">Genshin Impact</MenuItem>
              <MenuItem value="Custom Game">Custom</MenuItem>
            </Select>
          )}

          {/* Stock (Boolean) */}
          <FormControlLabel
            control={
              <Checkbox
                name="stock"
                checked={formData.stock}
                onChange={handleCheckboxChange}
              />
            }
            label="In Stock"
          />

          {/* Testing Mode (Boolean) */}
          <FormControlLabel
            control={
              <Checkbox
                name="isTesting"
                checked={formData.isTesting}
                onChange={handleCheckboxChange}
              />
            }
            label="Testing Mode (Hidden from public)"
          />

          {/* Spin Active (Boolean) */}
          {formData.type !== "account" && (
            <FormControlLabel
              control={
                <Checkbox
                  name="spinActive"
                  checked={formData.spinActive}
                  onChange={handleCheckboxChange}
                />
              }
              label="Spin Active"
            />
          )}

          {/* Spin Cost IDs Selector */}
          {formData.type !== "account" && formData.spinActive && (
            <div className="mb-4">
              <label className="block mb-2 text-white">
                Select Cost IDs for Spin
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formData.cost
                  .filter((costItem) => costItem.id)
                  .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                  .map((costItem, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.spinCostIds.includes(costItem.id)}
                        onChange={(e) =>
                          handleSpinCostChange(costItem.id, e.target.checked)
                        }
                      />
                      {`${costItem.amount} - $${costItem.price}`}
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* Main Image Upload */}
          <div className="mb-4 mt-4">
            {!imagePreview && !(formData.image && typeof formData.image === "string") && (
              <>
                <label className="block mb-2 text-white font-medium">Main Image</label>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    color: "#9CA3AF",
                    borderColor: "#4B5563",
                    textTransform: "none",
                    mb: 2,
                    "&:hover": { borderColor: "#6B7280" }
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    hidden
                  />
                </Button>
              </>
            )}
            {imagePreview && (
              <div className="mt-2">
                <Image
                  src={imagePreview}
                  height={100}
                  width={100}
                  alt="Main Image Preview"
                  className="rounded border border-gray-600"
                />
                <Button
                  onClick={handleRemoveImage}
                  color="secondary"
                  variant="outlined"
                  size="small"
                  className="mt-2 text-red-400 border-red-500/30 hover:border-red-500"
                >
                  Remove Image
                </Button>
              </div>
            )}
            {formData.image && typeof formData.image === "string" && !imagePreview && (
              <div className="mt-2">
                <Image
                  src={formData.image}
                  height={100}
                  width={100}
                  alt="Main Image"
                  className="rounded border border-gray-600"
                />
                <Button
                  onClick={handleRemoveImage}
                  color="secondary"
                  variant="outlined"
                  size="small"
                  className="mt-2 text-red-400 border-red-500/30 hover:border-red-500"
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          {/* Banner Upload */}
          <div className="mb-4">
            {!bannerPreview && !(formData.banner && typeof formData.banner === "string") && (
              <>
                <label className="block mb-2 text-white font-medium">Banner Image</label>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    color: "#9CA3AF",
                    borderColor: "#4B5563",
                    textTransform: "none",
                    mb: 2,
                    "&:hover": { borderColor: "#6B7280" }
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    onChange={handleBannerUpload}
                    accept="image/*"
                    hidden
                  />
                </Button>
              </>
            )}
            {bannerPreview && (
              <div className="mt-2">
                <Image
                  src={bannerPreview}
                  height={150}
                  width={300}
                  alt="Banner Preview"
                  className="rounded border border-gray-600"
                  style={{ objectFit: "cover" }}
                />
                <Button
                  onClick={handleRemoveBanner}
                  color="secondary"
                  variant="outlined"
                  size="small"
                  className="mt-2 text-red-400 border-red-500/30 hover:border-red-500"
                >
                  Remove Banner
                </Button>
              </div>
            )}
            {formData.banner &&
              typeof formData.banner === "string" &&
              !bannerPreview && (
                <div className="mt-2">
                  <Image
                    src={formData.banner}
                    height={150}
                    width={300}
                    alt="Banner"
                    className="rounded border border-gray-600"
                    style={{ objectFit: "cover" }}
                  />
                  <Button
                    onClick={handleRemoveBanner}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    className="mt-2 text-red-400 border-red-500/30 hover:border-red-500"
                  >
                    Remove Banner
                  </Button>
                </div>
              )}
          </div>

          {/* Slides Upload */}
          <div className="mb-6">
            <label className="block mb-2 text-white">Slides</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {slidePreviews.map((preview, index) => (
                <div key={index} className="relative group w-24 h-24 border border-gray-600 rounded flex items-center justify-center overflow-hidden">
                  <Image
                    src={preview}
                    fill
                    style={{ objectFit: "cover" }}
                    alt={`Slide ${index + 1}`}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(index)}
                      className="text-white hover:text-red-500"
                    >
                      <Delete />
                    </button>
                  </div>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-gray-500 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                <Add className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Add Slide</span>
                <input
                  type="file"
                  onChange={handleSlidesUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cost Items */}
          {!formData.isLink && formData.cost.map((costItem, index) => (
            <div key={index} className="mb-4 md:flex items-center gap-4">
              {/* ID Input */}
              <TextField
                fullWidth
                label="ID"
                value={costItem.id}
                onChange={(e) => handleCostChange(index, "id", e.target.value)}
                margin="normal"
                variant="outlined"
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
              />
              {/* Conditional Amount/Duration Input */}
              {formData.type === "account" ? (
                <TextField
                  fullWidth
                  label="Duration (Days)"
                  type="number"
                  value={costItem.durationDays || ""}
                  onChange={(e) =>
                    handleCostChange(index, "durationDays", e.target.value)
                  }
                  margin="normal"
                  variant="outlined"
                  sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="Amount"
                  value={costItem.amount || ""}
                  onChange={(e) =>
                    handleCostChange(index, "amount", e.target.value)
                  }
                  margin="normal"
                  variant="outlined"
                  sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
                />
              )}
              {/* Price Input */}
              <TextField
                fullWidth
                label="Price"
                value={costItem.price}
                onChange={(e) =>
                  handleCostChange(index, "price", e.target.value)
                }
                margin="normal"
                variant="outlined"
              />
              {/* Note Input */}
              <TextField
                fullWidth
                label="Note"
                value={costItem.note}
                onChange={(e) =>
                  handleCostChange(index, "note", e.target.value)
                }
                margin="normal"
                variant="outlined"
              />
              {/* Category Select */}
              <Select
                fullWidth
                value={costItem.category || "game"}
                onChange={(e) =>
                  handleCostChange(index, "category", e.target.value)
                }
                variant="outlined"
              >
                <MenuItem value="no_category">No Category</MenuItem>
                {costCategories.length > 0 &&
                  costCategories
                    .filter((cat) => cat.type === (formData.type || "topup"))
                    .map((category) => (
                      <MenuItem key={category.name} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
              </Select>
              {/* Image Upload for Cost Item */}
              <div className="mb-4 w-full md:w-auto">
                {!imagePreviews[index] && !(costItem.image && typeof costItem.image === "string") && (
                  <>
                    <label htmlFor={`costItemImage${index}`} className="block mb-2 text-white text-sm">
                      Upload Image
                    </label>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{
                        color: "#9CA3AF",
                        borderColor: "#4B5563",
                        textTransform: "none",
                        mb: 2,
                        "&:hover": { borderColor: "#6B7280" }
                      }}
                    >
                      Choose Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        id={`costItemImage${index}`}
                        onChange={(e) => handleCostImageUpload(index, e.target.files?.[0]!)}
                      />
                    </Button>
                  </>
                )}
                {imagePreviews[index] ||
                  (costItem.image && typeof costItem.image === "string") ? (
                  <div className="flex flex-col items-start gap-2">
                    <Image
                      src={imagePreviews[index] || (costItem.image as string)}
                      height="64"
                      width="64"
                      alt="Cost Item Preview"
                      className="rounded border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleCostImageRemove(index)}
                      className="text-xs text-red-400 hover:text-red-500 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
              {/* Remove Cost Item Button */}
              <Button
                onClick={() => handleRemoveCost(index)}
                color="secondary"
                variant="contained"
                className="mt-2"
              >
                <Delete />
              </Button>
            </div>
          ))}
          {!formData.isLink && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                onClick={handleAddCost}
                color="primary"
                variant="contained"
                className="bg-white"
              >
                Cost Item <Add className="ml-1" size={18} />
              </Button>
              <Button
                component="label"
                color="info"
                variant="outlined"
                sx={{ borderColor: "#3B82F6", color: "#60A5FA", "&:hover": { borderColor: "#60A5FA" } }}
              >
                Import CSV <Upload className="ml-1" size={18} />
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleImportCSV}
                />
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <div className="fixed bottom-0 md:left-64 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 z-[100] flex justify-end px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <Button
              disabled={loading}
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              size="large"
              className="w-full md:w-auto font-bold px-8 py-2.5 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Submitting..." : (product ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default ProductForm;
