import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-hot-toast";
import {
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "../../../services/addressServices";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const defaultCenter = {
  lat: 21.0285, // Default to Hanoi coordinates
  lng: 105.8542,
};

// Map controller component to handle map updates
const MapController = ({
  selectedPosition,
  onPositionChange,
}: {
  selectedPosition: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPosition) {
      map.setView(selectedPosition, 15, {
        animate: true,
        duration: 1,
      });
    }
  }, [selectedPosition, map]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onPositionChange(lat, lng);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onPositionChange]);

  return null;
};

const AddressAction = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<CreateAddressRequest>({
    province: "",
    district: "",
    ward: "",
    street: "",
    latitude: null,
    longitude: null,
  });

  // Location selection state
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // Queries
  const { data: addressData, isLoading: isLoadingAddress } =
    useGetAddressByIdQuery(Number(id), { skip: !isEditMode });
  const { data: provinces, isLoading: isLoadingProvinces } =
    useGetProvincesQuery();
  const { data: districts, isLoading: isLoadingDistricts } =
    useGetDistrictsQuery(Number(selectedProvince), { skip: !selectedProvince });
  const { data: wards, isLoading: isLoadingWards } = useGetWardsQuery(
    Number(selectedDistrict),
    { skip: !selectedDistrict }
  );

  // Mutations
  const [createAddress] = useCreateAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();

  // Load address data in edit mode
  useEffect(() => {
    if (addressData) {
      setFormData({
        province: addressData.province,
        district: addressData.district,
        ward: addressData.ward,
        street: addressData.street,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
      });
      // Set selected locations
      setSelectedProvince(addressData.province);
      setSelectedDistrict(addressData.district);
      setSelectedWard(addressData.ward);
    }
  }, [addressData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle location selection changes
  const handleProvinceChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedProvince(value);
    setSelectedDistrict("");
    setSelectedWard("");
    setFormData((prev) => ({
      ...prev,
      province: provinces?.find((p) => p.code.toString() === value)?.name || "",
      district: "",
      ward: "",
    }));
  };

  const handleDistrictChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedDistrict(value);
    setSelectedWard("");
    setFormData((prev) => ({
      ...prev,
      district: districts?.find((d) => d.code.toString() === value)?.name || "",
      ward: "",
    }));
  };

  const handleWardChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedWard(value);
    setFormData((prev) => ({
      ...prev,
      ward: wards?.find((w) => w.code.toString() === value)?.name || "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && id) {
        const updateData: UpdateAddressRequest = {
          id: Number(id),
          ...formData,
          latitude: null,
          longitude: null,
        };
        await toast.promise(updateAddress(updateData).unwrap(), {
          loading: "Đang cập nhật địa chỉ...",
          success: "Cập nhật địa chỉ thành công!",
          error: (err) =>
            err?.data?.error || "Đã xảy ra lỗi khi cập nhật địa chỉ!",
        });
      } else {
        const createData: CreateAddressRequest = {
          ...formData,
          latitude: null,
          longitude: null,
        };
        await toast.promise(createAddress(createData).unwrap(), {
          loading: "Đang tạo địa chỉ mới...",
          success: "Tạo địa chỉ mới thành công!",
          error: (err) =>
            err?.data?.error || "Đã xảy ra lỗi khi tạo địa chỉ mới!",
        });
      }
      navigate("/address");
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (isLoadingAddress || isLoadingProvinces) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#101828" : "white",
          boxShadow: "none",
          color: theme.palette.mode === "dark" ? "white" : "inherit",
        }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {isEditMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Location Selection */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Tỉnh/Thành phố</InputLabel>
                  <Select
                    value={selectedProvince}
                    label="Tỉnh/Thành phố"
                    onChange={handleProvinceChange}
                    required>
                    {provinces?.map((province) => (
                      <MenuItem
                        key={province.code}
                        value={province.code.toString()}>
                        {province.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Quận/Huyện</InputLabel>
                  <Select
                    value={selectedDistrict}
                    label="Quận/Huyện"
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    required>
                    {districts?.map((district) => (
                      <MenuItem
                        key={district.code}
                        value={district.code.toString()}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select
                    value={selectedWard}
                    label="Phường/Xã"
                    onChange={handleWardChange}
                    disabled={!selectedDistrict}
                    required>
                    {wards?.map((ward) => (
                      <MenuItem key={ward.code} value={ward.code.toString()}>
                        {ward.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Street Input */}
              <TextField
                fullWidth
                label="Đường"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
                helperText="Tọa độ sẽ được tự động xác định dựa trên địa chỉ đầy đủ"
              />

              {/* Map Display Only */}
              {formData.latitude && formData.longitude && (
                <Box
                  sx={{
                    height: "400px",
                    width: "100%",
                    position: "relative",
                    "& .leaflet-container": {
                      width: "100%",
                      height: "100%",
                    },
                  }}>
                  <MapContainer
                    center={[formData.latitude, formData.longitude]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[formData.latitude, formData.longitude]}
                    />
                  </MapContainer>
                </Box>
              )}

              {/* Coordinates Display (Read-only) */}
              {formData.latitude && formData.longitude && (
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Vĩ độ"
                    value={formData.latitude}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    fullWidth
                    label="Kinh độ"
                    value={formData.longitude}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate("/address")}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    !formData.province ||
                    !formData.district ||
                    !formData.ward ||
                    !formData.street
                  }>
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddressAction;
