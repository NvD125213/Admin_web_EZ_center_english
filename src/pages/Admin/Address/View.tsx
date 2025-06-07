import { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material";
import {
  FiEdit2,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  Address,
} from "../../../services/addressServices";
import L from "leaflet";
import { toast } from "react-hot-toast";

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

// Custom marker icon with different color
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const defaultCenter = {
  lat: 21.0285, // Default to Hanoi coordinates
  lng: 105.8542,
};

// Add this helper function at the top level
const getGoogleMapsUrl = (lat: number, lng: number) => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

// Add this helper function at the top level
const calculateTotalPages = (total: number, limit: number) => {
  return Math.max(1, Math.ceil(total / limit));
};

// Add this component to handle map zooming
const MapController = ({
  selectedPosition,
  zoomLevel = 15,
}: {
  selectedPosition: [number, number] | null;
  zoomLevel?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPosition) {
      map.setView(selectedPosition, zoomLevel, {
        animate: true,
        duration: 1,
      });
    }
  }, [selectedPosition, map, zoomLevel]);

  return null;
};

const AddressList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const mapRef = useRef<L.Map>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const { data: addressesData, isLoading } = useGetAddressesQuery({
    page,
    limit,
    search,
    sort_by: "create_at",
    sort_order: "desc",
  });

  const [deleteAddress] = useDeleteAddressMutation();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRowClick = (address: Address) => {
    if (address.latitude && address.longitude) {
      setSelectedAddress(address);
    } else {
      toast.error("Địa chỉ này chưa có tọa độ!");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation(); // Prevent row click when clicking delete button
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    try {
      await toast.promise(deleteAddress(addressToDelete.id).unwrap(), {
        loading: "Đang xóa địa chỉ...",
        success: "Xóa địa chỉ thành công!",
        error: (err) => err?.data?.error || "Đã xảy ra lỗi khi xóa địa chỉ!",
      });
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error("Delete address error:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  // Calculate total pages
  const totalPages = addressesData
    ? calculateTotalPages(addressesData.total, addressesData.limit)
    : 1;

  if (isLoading) return <Typography>Đang tải...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.mode === "dark" ? "#101828" : "white",
          boxShadow: "none",
          color: theme.palette.mode === "dark" ? "white" : "inherit",
          mb: 3,
        }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5">Danh sách địa chỉ</Typography>
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={() => navigate("/address/detail")}>
              Thêm địa chỉ
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Tìm kiếm địa chỉ"
            value={search}
            onChange={handleSearch}
            sx={{ mb: 3 }}
          />

          {addressesData && (
            <Box
              sx={{
                mb: 3,
                width: "100%",
                height: "400px",
                position: "relative",
                "& .leaflet-container": {
                  width: "100%",
                  height: "100%",
                },
                "& .leaflet-tooltip": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1a1a1a" : "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "12px",
                  color: theme.palette.mode === "dark" ? "white" : "inherit",
                  fontSize: "14px",
                  minWidth: "220px",
                  "&::before": {
                    display: "none",
                  },
                },
                "& .leaflet-tooltip-top": {
                  marginTop: "-8px",
                },
                "& .leaflet-tooltip-bottom": {
                  marginBottom: "-8px",
                },
              }}>
              <MapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController
                  selectedPosition={
                    selectedAddress
                      ? [selectedAddress.latitude!, selectedAddress.longitude!]
                      : null
                  }
                />
                {addressesData.data.map(
                  (address) =>
                    address.latitude &&
                    address.longitude && (
                      <Marker
                        key={address.id}
                        position={[address.latitude, address.longitude]}
                        icon={createCustomIcon(
                          selectedAddress?.id === address.id
                            ? "#ff6b6b"
                            : "#ff0000"
                        )}>
                        <Tooltip
                          permanent={false}
                          direction="top"
                          offset={[0, -16]}
                          opacity={1}
                          className="custom-tooltip">
                          <Box
                            sx={{
                              minWidth: 220,
                              "& > *": {
                                display: "block",
                                lineHeight: 1.5,
                              },
                            }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: "bold",
                                mb: 0.5,
                                color: theme.palette.primary.main,
                              }}>
                              {address.street}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}>
                              {`${address.ward}, ${address.district}, ${address.province}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mb: 1,
                                fontFamily: "monospace",
                              }}>
                              {`Tọa độ: ${address.latitude.toFixed(
                                6
                              )}, ${address.longitude.toFixed(6)}`}
                            </Typography>
                            <Button
                              size="small"
                              href={getGoogleMapsUrl(
                                address.latitude,
                                address.longitude
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                p: 0,
                                minWidth: "auto",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                  textDecoration: "underline",
                                },
                              }}>
                              <Typography
                                variant="caption"
                                color="primary"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}>
                                Xem trên Google Maps
                              </Typography>
                            </Button>
                          </Box>
                        </Tooltip>
                        <Popup>
                          <Box
                            sx={{
                              p: 1.5,
                              minWidth: 250,
                              "& > *": {
                                display: "block",
                                lineHeight: 1.5,
                              },
                            }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: "bold",
                                mb: 1,
                                color: theme.palette.primary.main,
                              }}>
                              {address.street}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}>
                              {`${address.ward}, ${address.district}, ${address.province}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mb: 1.5,
                                fontFamily: "monospace",
                              }}>
                              {`Tọa độ: ${address.latitude.toFixed(
                                6
                              )}, ${address.longitude.toFixed(6)}`}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              href={getGoogleMapsUrl(
                                address.latitude,
                                address.longitude
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              fullWidth
                              sx={{
                                textTransform: "none",
                                fontSize: "0.875rem",
                              }}>
                              Xem trên Google Maps
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                    )
                )}
              </MapContainer>
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tỉnh/Thành phố</TableCell>
                  <TableCell>Quận/Huyện</TableCell>
                  <TableCell>Phường/Xã</TableCell>
                  <TableCell>Đường</TableCell>
                  <TableCell>Tọa độ</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addressesData?.data.map((address) => (
                  <TableRow
                    key={address.id}
                    onClick={() => handleRowClick(address)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.04)",
                      },
                      backgroundColor:
                        selectedAddress?.id === address.id
                          ? theme.palette.mode === "dark"
                            ? "rgba(255, 107, 107, 0.08)"
                            : "rgba(255, 107, 107, 0.04)"
                          : "inherit",
                    }}>
                    <TableCell>{address.province}</TableCell>
                    <TableCell>{address.district}</TableCell>
                    <TableCell>{address.ward}</TableCell>
                    <TableCell>{address.street}</TableCell>
                    <TableCell>
                      {address.latitude && address.longitude
                        ? `${address.latitude.toFixed(
                            6
                          )}, ${address.longitude.toFixed(6)}`
                        : "Chưa có"}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/address/detail/${address.id}`);
                          }}
                          size="small"
                          color="primary">
                          <FiEdit2 />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleDeleteClick(e, address)}
                          size="small"
                          color="error">
                          <FiTrash2 />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              startIcon={<FiChevronLeft />}>
              Trang trước
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: "120px",
                justifyContent: "center",
              }}>
              <Typography variant="body2" color="text.secondary">
                Trang
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  minWidth: "24px",
                  textAlign: "center",
                }}>
                {page}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / {totalPages}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              endIcon={<FiChevronRight />}>
              Trang sau
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description">
        <DialogTitle id="delete-dialog-title">Xác nhận xóa địa chỉ</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể
            hoàn tác.
            {addressToDelete && (
              <Box
                sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="body2" component="div">
                  {addressToDelete.street}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`${addressToDelete.ward}, ${addressToDelete.district}, ${addressToDelete.province}`}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressList;
