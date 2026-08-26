"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import {
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [announcementText, setAnnouncementText] = useState("");
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings");
      setAnnouncementText(res.data.announcementText || "");
      setIsAnnouncementActive(res.data.isAnnouncementActive || false);
      setIsMaintenanceMode(res.data.isMaintenanceMode || false);
      setMaintenanceMessage(res.data.maintenanceMessage || "We are currently undergoing maintenance. Please check back later.");
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsFetching(false);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "/settings");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/settings", {
        announcementText,
        isAnnouncementActive,
        isMaintenanceMode,
        maintenanceMessage,
      });
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <SettingsIcon className="text-primary" size={28} /> Global Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage site-wide configurations</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card sx={{ bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" color="white" mb={3}>
              Announcement Bar
            </Typography>

            <Box mb={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#A855F7' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#A855F7' },
                    }}
                  />
                }
                label={<Typography color="white">Enable Global Announcement</Typography>}
              />
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Announcement Text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="E.g., 🚀 SPECIAL OFFER! Get 20% off all top-ups today..."
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" color="error" mb={3}>
              Maintenance Mode
            </Typography>

            <Box mb={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isMaintenanceMode}
                    onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff4444' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ff4444' },
                    }}
                  />
                }
                label={<Typography color="white">Enable Maintenance Mode</Typography>}
              />
              <Typography variant="body2" color="gray" sx={{ ml: 4, mt: 0.5 }}>
                When enabled, regular users will be blocked from accessing the storefront. Admin routes remain accessible.
              </Typography>
            </Box>

            {isMaintenanceMode && (
              <Box mb={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Maintenance Message"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="E.g., We are currently upgrading our servers..."
                  variant="outlined"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save />}
            sx={{ bgcolor: "#A855F7", color: "white", "&:hover": { bgcolor: "#9333EA" }, px: 4, py: 1.5, borderRadius: 2 }}
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </Box>
      </form>
    </div>
  );
}
