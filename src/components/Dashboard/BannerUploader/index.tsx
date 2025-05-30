"use client";
import { useState, useEffect } from "react";
import { Pencil, Save, Trash2, ImagePlus, Plus, X, Upload } from "lucide-react";
import Loader from "@/components/Loader";
import Image from "next/image";

interface Slider {
  _id: string;
  title: string;
  description: string;
  images: {
    _id?: string;
    url: string;
  }[];
}
export default function App() {
  const [slider, setSlider] = useState<Slider | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await fetch("/api/sliders");
      if (response.ok) {
        const data = await response.json();
        setSlider(data.sliders[0]);
      }
    } catch (error) {
      console.error("Failed to fetch sliders:", error);
    }
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      // Update an existing slider
      const response = await fetch(`/api/sliders/?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slider),
      });

      if (response.ok) {
        fetchSliders(); // Refresh the slider list
      }
    } catch (error) {
      console.error("Failed to save slider:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    const newImage = {
      url: "",
    };
    const copySlider = slider;
    copySlider.images.push(newImage);
    setSlider({ ...copySlider });
  };

  const handleDeleteImage = async (index: number) => {
    const copySlider = slider;
    copySlider.images.splice(index, 1);
    setSlider({ ...copySlider });
    await handleSave(slider._id);
  };

  const handleReplaceImage = (index: number, newUrl: string) => {
    setSlider((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index].url = newUrl;
      return { ...prev, images: updatedImages };
    });
  };

  const handleUploadImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setImageUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        handleReplaceImage(index, url);
        console.log("Image uploaded successfully:", url);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setImageUploading(false);
    }
  };

  if (!slider) {
    return <Loader />;
  }

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4  bg-gray-900 ">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Sliders</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md 
                               bg-gray-700 text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={slider.title}
                      onChange={(e) =>
                        setSlider({
                          ...slider,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-600 rounded-md 
                               bg-gray-700 text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={slider.description}
                      onChange={(e) =>
                        setSlider({
                          ...slider,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">
                      Images
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {slider.images?.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-700">
                            <Image
                              width={500}
                              height={300}
                              src={image.url}
                              alt={`Slider Image ${index}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                              <Upload className="w-5 h-5 text-gray-300" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadImage(file, index);
                                }}
                              />
                            </label>
                            <button
                              onClick={() => handleDeleteImage(index)}
                              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAddImage}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 
                               rounded-md text-sm font-medium text-gray-200 
                               bg-gray-800 hover:bg-gray-700 
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      <ImagePlus className="w-5 h-5 mr-2" />
                      Add Image
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      disabled={
                        saving ||
                        imageUploading ||
                        !slider.title ||
                        !slider.description
                      }
                      onClick={() => handleSave(slider._id)}
                      className="inline-flex items-center px-4 py-2 disabled:opacity-80 
                       border border-transparent rounded-md 
                               text-sm font-medium text-white 
                               bg-blue-500 hover:bg-blue-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving || imageUploading
                        ? "Processing..."
                        : "Save Slider"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
