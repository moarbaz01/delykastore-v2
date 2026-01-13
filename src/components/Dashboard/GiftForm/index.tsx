"use client";

import React, { useState, useEffect } from "react";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    IconButton,
    Typography,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { Delete, Save, ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useProducts, useGift, useCreateGift, useUpdateGift, Product } from "@/hooks/useGifts";
import { CreateGiftData, UpdateGiftData } from "@/types/main";


interface GiftFormProps {
    mode: "create" | "edit";
    giftId?: string;
}

const GiftForm: React.FC<GiftFormProps> = ({ mode, giftId }) => {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCosts, setSelectedCosts] = useState<{ [key: number]: string[] }>({});

    // React Query hooks
    const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
    const { data: gift, isLoading: giftLoading, error: giftError } = useGift(giftId);
    const createGiftMutation = useCreateGift();
    const updateGiftMutation = useUpdateGift();

    const [formData, setFormData] = useState<{
        productId: string;
        bannerText: string;
        wageringLevels: Array<{
            level: number;
            wagering: number;
            costIds: string[];
        }>;
        startDate: string;
        endDate: string;
        features: { title: string; value: string }[];
        isActive: boolean;
    }>({
        productId: "",
        bannerText: "",
        wageringLevels: [{ level: 1, wagering: 0, costIds: [] }],
        startDate: "",
        endDate: "",
        features: [{ title: "", value: "" }],
        isActive: true,
    });

    // Set form data when gift data is loaded (edit mode)
    useEffect(() => {
        if (mode === "edit" && gift && products.length > 0) {
            // First, find and set the selected product
            const product = products.find(p => p._id === gift.productId._id);
            setSelectedProduct(product || null);


            setFormData({
                productId: gift.productId._id,
                bannerText: gift.bannerText || "",
                startDate: gift.startDate ? new Date(gift.startDate).toISOString().split('T')[0] : "",
                endDate: gift.endDate ? new Date(gift.endDate).toISOString().split('T')[0] : "",
                features: gift.features || [{ title: "", value: "" }],
                isActive: gift.isActive,
                wageringLevels: gift.wageringLevels || [{ level: 1, wagering: 0, costIds: [] }],
            });
            // Initialize selected costs for each wagering level
            const initialSelectedCosts: { [key: number]: string[] } = {};
            gift.wageringLevels?.forEach((level) => {
                initialSelectedCosts[level.level] = level.costIds || [];
            });
            setSelectedCosts(initialSelectedCosts);
        }
    }, [gift, mode, products]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    // Handle select change
    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "productId") {
            const product = products.find(p => p._id === value);
            setSelectedProduct(product || null);
            setSelectedCosts({});
        }
    };

    // Handle cost selection for specific wagering level
    const handleCostSelection = (level: number, costId: string) => {
        console.log('Before selection - selectedCosts:', selectedCosts);
        console.log('Level:', level, 'Clicking costId:', costId);

        const levelCosts = selectedCosts[level] || [];
        const newLevelCosts = levelCosts.includes(costId)
            ? levelCosts.filter(id => id !== costId)
            : [...levelCosts, costId];

        const newSelectedCosts = {
            ...selectedCosts,
            [level]: newLevelCosts
        };

        console.log('After selection - newSelectedCosts:', newSelectedCosts);

        setSelectedCosts(newSelectedCosts);
    };


    // Handle wagering levels array changes
    const handleWageringLevelChange = (index: number, field: string, value: number) => {
        const newWageringLevels = [...formData.wageringLevels];
        newWageringLevels[index] = { ...newWageringLevels[index], [field]: value };
        setFormData((prev) => ({ ...prev, wageringLevels: newWageringLevels }));
    };

    const addWageringLevel = () => {
        const newLevel = Math.max(...formData.wageringLevels.map(l => l.level)) + 1;
        setFormData((prev) => ({
            ...prev,
            wageringLevels: [...prev.wageringLevels, { level: newLevel, wagering: 0, costIds: [] }],
        }));
    };

    const removeWageringLevel = (index: number) => {
        const newWageringLevels = formData.wageringLevels.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, wageringLevels: newWageringLevels }));
    };

    // Handle features array changes
    const handleFeatureChange = (index: number, field: string, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFormData((prev) => ({ ...prev, features: newFeatures }));
    };

    const addFeatureField = () => {
        setFormData((prev) => ({
            ...prev,
            features: [...prev.features, { title: "", value: "" }],
        }));
    };

    const removeFeatureField = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, features: newFeatures }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.productId) {
            toast.error("Please select a product");
            return;
        }

        if (!formData.bannerText) {
            toast.error("Please enter banner text");
            return;
        }

        if (formData.wageringLevels.length === 0) {
            toast.error("Please add at least one wagering level");
            return;
        }


        if (!formData.startDate || !formData.endDate) {
            toast.error("Please select start and end dates");
            return;
        }


        // Check if at least one level has selected costs
        const hasSelectedCosts = Object.values(selectedCosts).some(costs => costs.length > 0);

        if (!hasSelectedCosts) {
            toast.error("Please select at least one cost for any wagering level");
            return;
        }

        // Find the selected product to get the proper structure
        const selectedProductForSubmit = products.find(p => p._id === formData.productId);

        if (!selectedProductForSubmit) {
            toast.error("Selected product not found");
            return;
        }

        const submitData = {
            _id: '', // Will be generated by the server
            productId: selectedProductForSubmit._id,
            bannerText: formData.bannerText || undefined,
            wageringLevels: formData.wageringLevels.map(level => ({
                level: level.level,
                wagering: level.wagering,
                costIds: selectedCosts[level.level] || []
            })),
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            features: formData.features.filter(feature => feature.title && feature.value),
            isActive: formData.isActive,
        };


        try {
            if (mode === "create") {
                await createGiftMutation.mutateAsync(submitData as CreateGiftData);
            } else {
                await updateGiftMutation.mutateAsync({ giftId: giftId!, data: submitData as UpdateGiftData });
            }
            router.push("/dashboard/gifts");
        } catch (error) {
            // Error handling is done in the mutation hooks
        }
    };

    return (
        <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">
                        {mode === "create" ? "Create New Gift" : "Edit Gift"}
                    </h1>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => router.push("/dashboard/gifts")}
                        className="border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                    >
                        Back to Gifts
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-gray-800 rounded-xl p-4 max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Selection */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel className="text-gray-300">Product *</InputLabel>
                            <Select
                                name="productId"
                                value={formData.productId}
                                onChange={handleSelectChange}
                                label="Product *"
                                required
                                disabled={productsLoading}
                                className="bg-gray-700 text-white"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#4B5563',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#6B7280',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#ff962d',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#9CA3AF',
                                    },
                                    '& .MuiSelect-select': {
                                        color: 'white',
                                    },
                                }}
                            >
                                {products.map((product) => (
                                    <MenuItem key={product._id} value={product._id}>
                                        {product.name}
                                    </MenuItem>
                                ))}
                                {productsLoading && (
                                    <MenuItem disabled>Loading products...</MenuItem>
                                )}
                                {productsError && (
                                    <MenuItem disabled>Error loading products</MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        {/* Banner Text */}
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Banner Text"
                            name="bannerText"
                            value={formData.bannerText}
                            onChange={handleInputChange}
                            className="bg-gray-700"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4B5563',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#6B7280',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ff962d',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#9CA3AF',
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                },
                            }}
                        />

                        {/* Active Status Toggle */}
                        <div className="mt-6">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#ff962d',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#ff962d',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography className="text-gray-300">
                                        Active Status
                                    </Typography>
                                }
                            />
                            <Typography variant="caption" className="text-gray-400 block mt-1">
                                Enable or disable this gift campaign
                            </Typography>
                        </div>

                        {/* Wagering Levels */}
                        <div className="mt-6">
                            <Typography variant="h6" className="text-white mb-3">
                                Wagering Levels
                            </Typography>
                            {formData.wageringLevels.map((level, index) => (
                                <div key={index} className="flex gap-3 mb-3 items-center">
                                    <TextField
                                        label="Level"
                                        type="number"
                                        value={level.level}
                                        onChange={(e) => handleWageringLevelChange(index, 'level', Number(e.target.value))}
                                        className="w-24 bg-gray-700"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#4B5563',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#6B7280',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#ff962d',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#9CA3AF',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                    <TextField
                                        label="Wagering Requirement"
                                        type="number"
                                        value={level.wagering}
                                        onChange={(e) => handleWageringLevelChange(index, 'wagering', Number(e.target.value))}
                                        className="flex-1 bg-gray-700"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#4B5563',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#6B7280',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#ff962d',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#9CA3AF',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                    {formData.wageringLevels.length > 1 && (
                                        <IconButton onClick={() => removeWageringLevel(index)} color="error" size="small">
                                            <Delete />
                                        </IconButton>
                                    )}
                                </div>
                            ))}
                            <Button
                                onClick={addWageringLevel}
                                variant="outlined"
                                size="small"
                                className="mt-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                            >
                                Add Wagering Level
                            </Button>
                        </div>

                        {/* Date Range */}
                        <TextField
                            margin="normal"
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            className="bg-gray-700"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4B5563',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#6B7280',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ff962d',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#9CA3AF',
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            className="bg-gray-700"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4B5563',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#6B7280',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ff962d',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#9CA3AF',
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                },
                            }}
                        />
                    </div>

                    {/* Costs Section */}
                    <div className="mt-6">
                        <Typography variant="h6" className="text-white mb-3">
                            Costs per Wagering Level
                        </Typography>

                        {formData.wageringLevels.map((wageringLevel) => (
                            <div key={wageringLevel.level} className="mb-6 p-4 bg-gray-700 rounded-lg">
                                <Typography variant="h6" className="text-white mb-3">
                                    Level {wageringLevel.level} - Wagering: {wageringLevel.wagering}
                                </Typography>

                                {selectedProduct && selectedProduct.cost && selectedProduct.cost.length > 0 ? (
                                    <>
                                        <Typography variant="body2" className="text-gray-300 mb-2">
                                            Select costs for Level {wageringLevel.level}:
                                        </Typography>
                                        {selectedProduct.cost.map((cost, index) => (
                                            <div key={cost.id} className="flex gap-3 mb-2 items-center p-2 bg-gray-600 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCosts[wageringLevel.level]?.includes(cost.id) || false}
                                                    onChange={() => handleCostSelection(wageringLevel.level, cost.id)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                />
                                                {cost.image && (
                                                    <div className="w-12 h-12 flex-shrink-0 ml-2">
                                                        <img
                                                            src={cost.image}
                                                            alt={`Cost ${index + 1}`}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex-1 ml-2">
                                                        <Typography variant="body2" className="text-gray-300">Amount: {cost.amount}</Typography>
                                                    </div>
                                                    <div className="flex-1">
                                                        <Typography variant="body2" className="text-gray-300">Price: ${cost.price}</Typography>
                                                    </div>
                                                    {cost.category && (
                                                        <div className="flex-shrink-0">
                                                            <Typography variant="caption" className="text-gray-400 bg-gray-700 px-2 py-1 rounded text-xs">
                                                                {cost.category}
                                                            </Typography>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <Typography variant="body2" className="text-gray-400">
                                        Please select a product first to see available costs.
                                    </Typography>
                                )}
                            </div>
                        ))}
                    </div>


                    {/* Features Section */}
                    <div className="mt-6">
                        <Typography variant="h6" className="text-white mb-3">
                            Features
                        </Typography>
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex gap-3 mb-3 items-center">
                                <TextField
                                    label="Title"
                                    value={feature.title}
                                    onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                                    className="flex-1 bg-gray-700"
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#4B5563',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#6B7280',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#ff962d',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#9CA3AF',
                                        },
                                        '& .MuiInputBase-input': {
                                            color: 'white',
                                        },
                                    }}
                                />
                                <TextField
                                    label="Value"
                                    value={feature.value}
                                    onChange={(e) => handleFeatureChange(index, "value", e.target.value)}
                                    className="flex-1 bg-gray-700"
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#4B5563',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#6B7280',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#ff962d',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#9CA3AF',
                                        },
                                        '& .MuiInputBase-input': {
                                            color: 'white',
                                        },
                                    }}
                                />
                                {formData.features.length > 1 && (
                                    <IconButton onClick={() => removeFeatureField(index)} color="error" size="small">
                                        <Delete />
                                    </IconButton>
                                )}
                            </div>
                        ))}
                        <Button
                            onClick={addFeatureField}
                            variant="outlined"
                            size="small"
                            className="mt-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                        >
                            Add Feature
                        </Button>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="outlined"
                            onClick={() => router.push("/dashboard/gifts")}
                            className="border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createGiftMutation.isPending || updateGiftMutation.isPending || !formData.productId || productsLoading}
                            startIcon={<Save />}
                            className="bg-primary hover:bg-primary/90"
                            sx={{
                                backgroundColor: '#ff962d',
                                '&:hover': {
                                    backgroundColor: '#e6851f',
                                },
                            }}
                        >
                            {createGiftMutation.isPending || updateGiftMutation.isPending
                                ? "Saving..."
                                : mode === "create" ? "Create Gift" : "Update Gift"
                            }
                        </Button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default GiftForm;
