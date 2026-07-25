"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Trash2, Save, ImagePlus } from "lucide-react";
import Loader from "@/components/Loader";
import { useSliders, useUpdateSlider } from "@/hooks/useSliders";
import toast from "react-hot-toast";

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

  const { data: sliders, isLoading } = useSliders();
  const updateSliderMutation = useUpdateSlider();

  useEffect(() => {
    if (sliders && sliders.length > 0 && !slider) {
      setSlider(sliders[0]);
    }
  }, [sliders, slider]);

  const handleSave = async (id: string) => {
    if (!slider) return;
    try {
      await updateSliderMutation.mutateAsync({ id, slider });
      toast.success("Slider updated successfully!");
    } catch (error) {
      console.error("Failed to save slider:", error);
      toast.error("Failed to update slider");
    }
  };

  const handleAddImage = () => {
    if (!slider) return;
    const newImage = {
      url: "",
    };
    const updatedImages = [...slider.images, newImage];
    setSlider({ ...slider, images: updatedImages });
  };

  const handleDeleteImage = async (index: number) => {
    if (!slider) return;
    const updatedImages = [...slider.images];
    updatedImages.splice(index, 1);
    const updatedSlider = { ...slider, images: updatedImages };
    setSlider(updatedSlider);
  };

  const handleReplaceImage = (index: number, newUrl: string) => {
    setSlider((prev) => {
      if (!prev) return null;
      const updatedImages = [...prev.images];
      updatedImages[index] = { ...updatedImages[index], url: newUrl };
      return { ...prev, images: updatedImages };
    });
  };

  const handleUploadImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "slider");

    try {
      setImageUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        handleReplaceImage(index, url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  if (isLoading || !slider) {
    return <Loader />;
  }

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Sliders</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-secondary rounded-xl shadow-md overflow-hidden border border-darkBlue">
            <div className="bg-secondary rounded-xl shadow-md overflow-hidden border border-darkBlue">
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-darkBlue rounded-md 
                               bg-navy text-white
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
                      className="w-full px-3 py-2 border border-darkBlue rounded-md 
                               bg-navy text-white
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
                          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-navy border border-darkBlue">
                            {image.url ? (
                              <Image
                                width={500}
                                height={300}
                                src={image.url}
                                alt={`Slider Image ${index}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer p-2 bg-secondary rounded-full hover:bg-darkBlue transition-colors">
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
                              className="p-2 bg-secondary rounded-full hover:bg-darkBlue transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAddImage}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-darkBlue 
                                rounded-md text-sm font-medium text-gray-200 
                                bg-secondary hover:bg-navy 
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      <ImagePlus className="w-5 h-5 mr-2" />
                      Add Image
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      disabled={
                        updateSliderMutation.isPending ||
                        imageUploading ||
                        !slider.title ||
                        !slider.description
                      }
                      onClick={() => handleSave(slider._id)}
                      className="inline-flex items-center px-4 py-2 disabled:opacity-80 
                       border border-transparent rounded-md 
                                text-sm font-bold text-black 
                                bg-primary hover:bg-[#e6851f] transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSliderMutation.isPending || imageUploading
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
