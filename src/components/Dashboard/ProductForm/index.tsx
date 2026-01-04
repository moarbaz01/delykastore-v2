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
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CostItem {
  id: string;
  amount: string;
  price: string;
  note?: string;
  category?: string;
  image?: File | string | null;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  isApi: boolean;
  region: string;
  game: string;
  apiName: string;
  slides: (string | File)[];
  banner: string | File;
  image: string | File | null;
  isDeleted: boolean;
  category: string;
  cost: CostItem[];
  stock: boolean;
  spinActive: boolean;
  spinCostIds: string[];
}

const ProductForm = ({ product }: { product?: Product }) => {
  const [formData, setFormData] = useState<Product>({
    _id: product?._id || "",
    name: product?.name || "",
    description: product?.description || "",
    isApi: product?.isApi || false,
    region: product?.region || "",
    game: product?.game || "",
    apiName: product?.apiName || "",
    image: product?.image || null,
    isDeleted: product?.isDeleted || false,
    category: product?.category || "game",
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
    { name: string; _id: string }[]
  >([]);

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
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value as string }));
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

    if (!formData.game) {
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
      (cost) => cost.id && cost.price && cost.amount
    );

    if (!isValid) {
      toast.error("Please fill all cost fields with valid values.");
      toast.dismiss(loadingRef.current);
      setLoading(false);
      return;
    }

    // Form data for the request
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("isApi", JSON.stringify(formData.isApi));
    data.append("game", formData.game);
    if (formData.isApi) {
      data.append("apiName", formData.apiName);
      if (formData.game === "mobilelegends") {
        data.append("region", formData.region);
      } else {
        data.append("region", "");
      }
    }
    if (formData.image && typeof formData.image !== "string") {
      data.append("image", formData.image);
    }
    data.append("isDeleted", JSON.stringify(formData.isDeleted));
    data.append("category", formData.category);
    data.append("stock", formData.stock.toString());
    data.append("spinActive", formData.spinActive.toString());
    data.append("spinCostIds", JSON.stringify(formData.spinCostIds));

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

    data.append("cost", JSON.stringify(formData.cost));
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
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold text-white mb-6">
        {product ? "Edit Product" : "Create Product"}
      </h1>
      <Paper
        className="p-6"
        sx={{ backgroundColor: "#374151", color: "#D1D5DB" }}
      >
        <form>
          {/* Name */}
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
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
            sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
          />

          {/* Is API */}
          <FormControlLabel
            control={
              <Checkbox
                name="isApi"
                checked={formData.isApi}
                onChange={handleCheckboxChange}
                sx={{ color: "#E5E7EB" }}
              />
            }
            label="Is API"
            sx={{ color: "#D1D5DB" }}
          />

          {/* API Name (Select) */}
          {formData.isApi && (
            <>
              <Select
                fullWidth
                name="apiName"
                value={formData.apiName}
                onChange={handleSelectChange}
                displayEmpty
                sx={{
                  margin: "16px 0",
                  backgroundColor: "#1F2937",
                  color: "#E5E7EB",
                }}
              >
                <MenuItem value="">Select API Name</MenuItem>
                <MenuItem value="Smile One Api">Smile One Api</MenuItem>
                {/* <MenuItem value="Garena Api">Garena Api</MenuItem> */}
                <MenuItem value="TopUp Ghor Api"> Top-Up Ghor Api</MenuItem>
                <MenuItem value="Bangla Api">Bangla Api</MenuItem>
              </Select>
              {(formData.apiName === "Smile One Api" ||
                formData.game === "mobilelegends") && (
                <Select
                  fullWidth
                  name="region"
                  value={formData.region}
                  onChange={handleSelectChange}
                  displayEmpty
                  sx={{
                    margin: "16px 0",
                    backgroundColor: "#1F2937",
                    color: "#E5E7EB",
                  }}
                >
                  <MenuItem value="">Select Region</MenuItem>
                  <MenuItem value="brazil">Brazil</MenuItem>
                  <MenuItem value="philippines">Philippines</MenuItem>
                  <MenuItem value="indonesia">Indonesia</MenuItem>
                </Select>
              )}
            </>
          )}

          {/* Game */}
          <Select
            fullWidth
            name="game"
            value={formData.game}
            onChange={handleSelectChange}
            displayEmpty
            sx={{
              margin: "16px 0",
              backgroundColor: "#1F2937",
              color: "#E5E7EB",
            }}
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

          {/* Stock (Boolean) */}
          <FormControlLabel
            control={
              <Checkbox
                name="stock"
                checked={formData.stock}
                onChange={handleCheckboxChange}
                sx={{ color: "#E5E7EB" }}
              />
            }
            label="In Stock"
            sx={{ color: "#D1D5DB", display: "block" }}
          />

          {/* Spin Active (Boolean) */}
          <FormControlLabel
            control={
              <Checkbox
                name="spinActive"
                checked={formData.spinActive}
                onChange={handleCheckboxChange}
                sx={{ color: "#E5E7EB" }}
              />
            }
            label="Spin Active"
            sx={{ color: "#D1D5DB" }}
          />

          {/* Spin Cost IDs Selector */}
          {formData.spinActive && (
            <div className="mb-4">
              <label className="block mb-2 text-white">
                Select Cost IDs for Spin
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formData.cost
                  .filter((costItem) => costItem.id)
                  .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                  .map((costItem, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={formData.spinCostIds.includes(costItem.id)}
                          onChange={(e) =>
                            handleSpinCostChange(costItem.id, e.target.checked)
                          }
                          sx={{ color: "#E5E7EB" }}
                        />
                      }
                      label={`${costItem.amount} - $${costItem.price}`}
                      sx={{ color: "#D1D5DB" }}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Main Image Upload */}
          <div className="mb-4">
            <label className="block mb-2">Main Image</label>
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="mb-2"
            />
            {imagePreview && (
              <div className="mt-2">
                <Image
                  src={imagePreview}
                  height={100}
                  width={100}
                  alt="Main Image Preview"
                  className="rounded"
                />
                <Button
                  onClick={handleRemoveImage}
                  color="secondary"
                  variant="contained"
                  className="mt-2"
                >
                  Remove Image
                </Button>
              </div>
            )}
            {formData.image && typeof formData.image === "string" && (
              <div className="mt-2">
                <Image
                  src={formData.image}
                  height={100}
                  width={100}
                  alt="Main Image"
                  className="rounded"
                />
              </div>
            )}
          </div>

          {/* Banner Upload */}
          <div className="mb-4">
            <label className="block mb-2">Banner Image</label>
            <input
              type="file"
              onChange={handleBannerUpload}
              accept="image/*"
              className="mb-2"
            />
            {bannerPreview && (
              <div className="mt-2">
                <Image
                  src={bannerPreview}
                  height={150}
                  width={300}
                  alt="Banner Preview"
                  className="rounded"
                  style={{ objectFit: "cover" }}
                />
                <Button
                  onClick={handleRemoveBanner}
                  color="secondary"
                  variant="contained"
                  className="mt-2"
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
                    className="rounded"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
          </div>

          {/* Slides Upload */}
          <div className="mb-4">
            <label className="block mb-2">Slides</label>
            <input
              type="file"
              onChange={handleSlidesUpload}
              accept="image/*"
              multiple
              className="mb-2"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {slidePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <Image
                    src={preview}
                    height={100}
                    width={100}
                    alt={`Slide ${index + 1}`}
                    className="rounded"
                  />
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => handleRemoveSlide(index)}
                    className="absolute top-0 right-0 min-w-0 p-1"
                    variant="contained"
                  >
                    <Delete fontSize="small" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <Select
            fullWidth
            name="category"
            value={formData.category}
            onChange={handleSelectChange}
            displayEmpty
            sx={{
              margin: "16px 0",
              backgroundColor: "#1F2937",
              color: "#E5E7EB",
            }}
          >
            <MenuItem value="">Select Category</MenuItem>
            <MenuItem value="game">Game</MenuItem>
          </Select>

          {/* Cost Items */}
          {formData.cost.map((costItem, index) => (
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
              {/* Amount Input */}
              <TextField
                fullWidth
                label="Amount"
                value={costItem.amount}
                onChange={(e) =>
                  handleCostChange(index, "amount", e.target.value)
                }
                margin="normal"
                variant="outlined"
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
              />
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
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
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
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
              />
              {/* Category Select */}
              <Select
                fullWidth
                value={costItem.category || "game"}
                onChange={(e) =>
                  handleCostChange(index, "category", e.target.value)
                }
                variant="outlined"
                sx={{ color: "#E5E7EB", backgroundColor: "#1F2937" }}
              >
                <MenuItem value="no_category">No Category</MenuItem>
                {costCategories.length > 0 &&
                  costCategories.map((category) => (
                    <MenuItem key={category.name} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
              {/* Image Upload for Cost Item */}
              <div className="mb-4">
                <label htmlFor={`costItemImage${index}`} className="block mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id={`costItemImage${index}`}
                  onChange={(e) =>
                    handleCostImageUpload(index, e.target.files?.[0]!)
                  }
                  className="mb-2"
                />
                {imagePreviews[index] ||
                (costItem.image && typeof costItem.image === "string") ? (
                  <Image
                    src={imagePreviews[index] || (costItem.image as string)}
                    height="100"
                    alt="Cost Item Preview"
                    width="100"
                  />
                ) : null}
                {costItem.image && typeof costItem.image !== "string" && (
                  <Button
                    color="secondary"
                    onClick={() => handleCostImageRemove(index)}
                    variant="contained"
                    className="mt-2"
                  >
                    Remove Image
                  </Button>
                )}
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
          <Button
            onClick={handleAddCost}
            color="primary"
            variant="contained"
            className="mb-4 bg-white"
          >
            Cost Item <Add />
          </Button>

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              disabled={loading}
              onClick={handleSubmit}
              color="primary"
              variant="contained"
            >
              Submit
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default ProductForm;
