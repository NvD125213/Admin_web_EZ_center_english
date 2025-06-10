import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ConsultationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  consultation: {
    id: number;
    name: string;
    email: string;
    phone: string;
    create_at: string;
    course: {
      menu: {
        name: string;
      };
    };
  } | null;
}

const ConsultationDetailDialog: React.FC<ConsultationDetailDialogProps> = ({
  open,
  onClose,
  consultation,
}) => {
  if (!consultation) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgb(70, 95, 255)",
          color: "white",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold" }}>
              Chi tiết yêu cầu tư vấn
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              {consultation.course.menu.name}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, bgcolor: "grey.50" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}>
            Thời gian
          </Typography>
          <Chip
            icon={<AccessTimeIcon />}
            label={format(
              new Date(consultation.create_at),
              "HH:mm:ss - dd/MM/yyyy",
              {
                locale: vi,
              }
            )}
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              "& .MuiChip-icon": { color: "#2196F3" },
            }}
          />
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
              mb: 1,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
            Thông tin người gửi
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid",
                borderColor: "grey.100",
              }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                <PersonIcon sx={{ fontSize: 18, color: "#2196F3" }} />
                Yêu cầu tư vấn
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: "text.primary" }}>
                {consultation.name}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2.5,
                flexDirection: { xs: "column", sm: "row" },
              }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid",
                  borderColor: "grey.100",
                }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}>
                  <EmailIcon sx={{ fontSize: 18, color: "#2196F3" }} />
                  Email
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "text.primary" }}>
                  {consultation.email}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid",
                  borderColor: "grey.100",
                }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}>
                  <PhoneIcon sx={{ fontSize: 18, color: "#2196F3" }} />
                  Số điện thoại
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "text.primary" }}>
                  {consultation.phone}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mt: 4,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
            Thông tin khóa học
          </Typography>

          <Box
            sx={{
              p: 2.5,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid",
              borderColor: "grey.100",
            }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: "text.primary" }}>
              <SchoolIcon sx={{ color: "#2196F3", mr: 1 }} />

              {consultation.course.menu.name}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDetailDialog;
