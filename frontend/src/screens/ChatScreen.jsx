import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { toast } from "react-toastify";
import {
  useGetChatsQuery,
  useSendMessageMutation,
  useCreateChatMutation,
  useGetMessagesQuery,
} from "../slices/chatApiSlice";
import { useGetPatientsQuery } from "../slices/patientApiSlice";
import { useGetDoctorsQuery } from "../slices/doctorApiSlice";

const ENDPOINT = "http://localhost:5000"; // Reemplaza con tu endpoint si es necesario

const ChatScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: chats = [],
    isLoading: loadingChats,
    refetch: refetchChats,
  } = useGetChatsQuery();

  const { data: patients = [], isLoading: loadingPatients } =
    useGetPatientsQuery();
  const { data: doctors = [], isLoading: loadingDoctors } =
    useGetDoctorsQuery();

  const [sendMessage] = useSendMessageMutation();
  const [createChat] = useCreateChatMutation();

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newMessageNotifications, setNewMessageNotifications] = useState([]);

  const socketRef = useRef();

  // Conectar a Socket.IO
  useEffect(() => {
    if (userInfo) {
      socketRef.current = io(ENDPOINT);
      socketRef.current.emit("setup", userInfo);
      socketRef.current.on("connected", () => setSocketConnected(true));

      // Escuchar mensajes nuevos
      socketRef.current.on("messageReceived", (newMessageReceived) => {
        const chatId = newMessageReceived.chat._id || newMessageReceived.chat;
        const senderId =
          newMessageReceived.sender._id || newMessageReceived.sender;

        if (senderId === userInfo._id) {
          // Ignorar mensajes enviados por el usuario actual
          return;
        }

        if (!selectedChat || selectedChat._id !== chatId) {
          // Si el mensaje es para otro chat
          setNewMessageNotifications((prev) => [...new Set([...prev, chatId])]);
          toast.info("Nuevo mensaje en otro chat");
        } else {
          // Mensaje para el chat seleccionado
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [userInfo]);

  // Obtener mensajes del chat seleccionado
  const { data: chatMessages = [], refetch: refetchMessages } =
    useGetMessagesQuery(selectedChat?._id, {
      skip: !selectedChat,
    });

  useEffect(() => {
    if (chatMessages) setMessages(chatMessages);
  }, [chatMessages]);

  // Unirse al chat seleccionado
  useEffect(() => {
    if (socketConnected && selectedChat) {
      socketRef.current.emit("joinChat", selectedChat._id);
      refetchMessages();

      // Eliminar notificación de este chat
      setNewMessageNotifications((prev) =>
        prev.filter((chatId) => chatId !== selectedChat._id)
      );
    }
  }, [selectedChat, socketConnected]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }

    if (!selectedChat || !selectedChat._id) {
      toast.error("Debes seleccionar un chat válido");
      return;
    }

    try {
      const messageData = { chatId: selectedChat._id, content: newMessage };
      const sentMessage = await sendMessage(messageData).unwrap();
      setNewMessage("");

      // Emitir el mensaje a través de Socket.IO
      socketRef.current.emit("sendMessage", sentMessage);

      // Actualizar mensajes en el chat actual
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
    } catch (error) {
      toast.error("Error al enviar el mensaje");
    }
  };

  const handleStartChat = async (participantId) => {
    if (!participantId) {
      toast.error("Debe seleccionar un participante");
      return;
    }

    try {
      const chat = await createChat({ participantId }).unwrap();
      setSelectedChat(chat);
      refetchChats();
      toast.success("Chat iniciado con éxito");
    } catch (error) {
      toast.error("Error al iniciar el chat");
    }
  };

  const renderParticipantsDropdown = () => {
    if (loadingPatients || loadingDoctors) {
      return <p>Cargando participantes...</p>;
    }

    if (patients.length === 0 && doctors.length === 0) {
      return <p>No hay pacientes o médicos disponibles</p>;
    }

    return (
      <select onChange={(e) => handleStartChat(e.target.value)}>
        <option value="">Selecciona un participante</option>
        {patients.length > 0 && (
          <optgroup label="Pacientes">
            {patients.map((patient) => (
              <option key={patient._id} value={patient.user?._id}>
                {patient.user?.name || "Paciente sin nombre"}
              </option>
            ))}
          </optgroup>
        )}
        {doctors.length > 0 && (
          <optgroup label="Médicos">
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor.user?._id}>
                {doctor.user?.name || "Médico sin nombre"}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    );
  };

  return (
    <div className="chat-container" style={styles.container}>
      <div className="sidebar" style={styles.sidebar}>
        <h2>Chats</h2>
        {loadingChats ? (
          <p>Cargando chats...</p>
        ) : chats.length > 0 ? (
          chats.map((chat) => {
            const chatId = chat._id;
            const isSelected = selectedChat?._id === chatId;
            const hasNewMessage = newMessageNotifications.includes(chatId);
            return (
              <div
                key={chatId}
                onClick={() => setSelectedChat(chat)}
                style={{
                  ...styles.chatItem,
                  backgroundColor: isSelected
                    ? "#f0f0f0"
                    : hasNewMessage
                    ? "#d1e7ff"
                    : "#fff",
                }}
              >
                {chat.participants
                  ?.filter((p) => p._id !== userInfo?._id)
                  .map((p) => p.name)
                  .join(", ") || "Sin participantes"}
                {hasNewMessage && <span style={styles.notificationDot}></span>}
              </div>
            );
          })
        ) : (
          <p>No hay chats disponibles</p>
        )}
        {userInfo &&
          (userInfo.isAdmin || userInfo.isDoctor) &&
          renderParticipantsDropdown()}
      </div>

      <div className="chat-box" style={styles.chatBox}>
        {selectedChat ? (
          <>
            <h2 style={styles.chatHeader}>
              Chat con{" "}
              {selectedChat.participants
                ?.filter((p) => p._id !== userInfo?._id)
                .map((p) => p.name)
                .join(", ") || "Sin participantes"}
            </h2>
            <div className="messages" style={styles.messages}>
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg?._id} style={styles.message}>
                    <strong>{msg?.sender?.name || "Sin nombre"}: </strong>
                    {msg?.content || ""}
                  </div>
                ))
              ) : (
                <p>No hay mensajes aún</p>
              )}
            </div>
            <div style={styles.messageInputContainer}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                style={styles.messageInput}
              />
              <button onClick={handleSendMessage} style={styles.sendButton}>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <p>Selecciona un chat para comenzar</p>
        )}
      </div>
    </div>
  );
};

// Estilos CSS en JS
const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "25%",
    borderRight: "1px solid #ddd",
    padding: "1rem",
  },
  chatItem: {
    padding: "0.5rem",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
    position: "relative",
  },
  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
  },
  chatHeader: {
    borderBottom: "1px solid #ddd",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "1rem",
  },
  message: {
    padding: "0.5rem",
    borderBottom: "1px solid #eee",
  },
  messageInputContainer: {
    display: "flex",
  },
  messageInput: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginRight: "0.5rem",
  },
  sendButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },
  notificationDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#ff4d4d",
  },
};

export default ChatScreen;
