import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useGetConsultationsQuery } from "../services/consultantServices";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "payment" | "consultation";
}

interface SocketContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: consultationsData } = useGetConsultationsQuery();

  // Sync consultations with notifications when data is loaded
  useEffect(() => {
    if (consultationsData?.data) {
      const consultationNotifications = consultationsData.data.map(
        (consultation) => ({
          id: `consultation-${consultation.id}`,
          title: "Yêu cầu tư vấn mới",
          message: `${consultation.name} đã gửi yêu cầu tư vấn cho khóa học ${consultation.course.menu.name}`,
          timestamp: consultation.create_at,
          read: false,
          type: "consultation" as const,
        })
      );

      // Merge with existing notifications, avoiding duplicates
      setNotifications((prevNotifications) => {
        const existingIds = new Set(prevNotifications.map((n) => n.id));
        const newNotifications = consultationNotifications.filter(
          (n) => !existingIds.has(n.id)
        );
        return [...newNotifications, ...prevNotifications];
      });
    }
  }, [consultationsData]);

  useEffect(() => {
    // Khởi tạo kết nối socket
    const socketInstance = io("http://localhost:4000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Lắng nghe sự kiện paymentStatusUpdate
    socketInstance.on("paymentStatusUpdate", (data) => {
      console.log("Received payment update:", data);
      const { payment } = data;

      if (payment) {
        const notification: Notification = {
          id: `${payment.id}-${Date.now()}`,
          title:
            payment.status === "COMPLETED"
              ? "Thanh toán thành công"
              : "Thanh toán thất bại",
          message:
            payment.status === "COMPLETED"
              ? `${payment.student.name} đã thanh toán thành công khóa học ${payment.class.course.name} - ${payment.class.name}`
              : `${payment.student.name} thanh toán thất bại khóa học ${payment.class.course.name} - ${payment.class.name}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "payment",
        };

        setNotifications((prev) => [notification, ...prev]);
      }
    });

    // Lắng nghe sự kiện newConsultation
    socketInstance.on("newConsultation", (data) => {
      console.log("Received new consultation:", data);
      const { consultation } = data;

      if (consultation) {
        const notification: Notification = {
          id: `consultation-${consultation.id}`,
          title: "Yêu cầu tư vấn mới",
          message: `${consultation.name} đã gửi yêu cầu tư vấn cho khóa học ${consultation.course.menu.name}`,
          timestamp: consultation.timestamp,
          read: false,
          type: "consultation",
        };

        setNotifications((prev) => {
          // Check if notification already exists
          const exists = prev.some((n) => n.id === notification.id);
          if (exists) return prev;
          return [notification, ...prev];
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        notifications,
        markAsRead,
        clearNotifications,
      }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
