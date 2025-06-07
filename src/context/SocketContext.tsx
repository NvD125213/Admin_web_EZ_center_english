import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
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

  useEffect(() => {
    // Khởi tạo kết nối socket
    const socketInstance = io("http://localhost:3000", {
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
        };

        setNotifications((prev) => [notification, ...prev]);
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
