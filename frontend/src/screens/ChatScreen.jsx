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
import '../assets/styles/chatScreen.css'; 

const ENDPOINT = "http://localhost:5000"; // Reemplaza con tu endpoint si es necesario

const ChatScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: chats = [],
    isLoading: loadingChats,
    refetch: refetchChats,
  } = useGetChatsQuery();

  const { data: patients = [], isLoading: loadingPatients } = useGetPatientsQuery();
  const { data: doctors = [], isLoading: loadingDoctors } = useGetDoctorsQuery();

  const [sendMessage] = useSendMessageMutation();
  const [createChat] = useCreateChatMutation();

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  // Cambiamos newMessageNotifications a un objeto para almacenar contadores por chat
  const [newMessageNotifications, setNewMessageNotifications] = useState({});

  const socketRef = useRef();
  const selectedChatRef = useRef(selectedChat);

  // Actualizamos la referencia de selectedChat cuando cambia
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Conectar a Socket.IO una sola vez
  useEffect(() => {
    if (userInfo) {
      socketRef.current = io(ENDPOINT);
      socketRef.current.emit("setup", userInfo);
      socketRef.current.on("connected", () => setSocketConnected(true));

      // Escuchar mensajes nuevos
      socketRef.current.on("messageReceived", (newMessageReceived) => {
        const chatId = newMessageReceived.chat._id || newMessageReceived.chat;
        const senderId = newMessageReceived.sender._id || newMessageReceived.sender;

        if (senderId === userInfo._id) {
          // Ignorar mensajes enviados por el usuario actual
          return;
        }

        if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
          // Si el mensaje es para el chat seleccionado, actualizar los mensajes automáticamente
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        } else {
          // Si el mensaje es para otro chat, incrementar el contador de mensajes no leídos
          setNewMessageNotifications((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || 0) + 1
          }));
          // Puedes mostrar una notificación si lo deseas
          // toast.info("Nuevo mensaje en otro chat");
        }
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [userInfo]);

  // Obtener mensajes del chat seleccionado
  const { data: chatMessages = [], refetch: refetchMessages } = useGetMessagesQuery(
    selectedChat?._id,
    { skip: !selectedChat }
  );

  useEffect(() => {
    if (chatMessages) setMessages(chatMessages);
  }, [chatMessages]);

  // Unirse al chat seleccionado
  useEffect(() => {
    if (socketConnected && selectedChat) {
      socketRef.current.emit("joinChat", selectedChat._id);
      refetchMessages();

      // Eliminar el contador de mensajes no leídos para este chat
      setNewMessageNotifications((prev) => {
        const { [selectedChat._id]: _, ...rest } = prev;
        return rest;
      });
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
    <div className="chat-container">
      <div className="sidebar">
        <h2>Chats</h2>
        {loadingChats ? (
          <p>Cargando chats...</p>
        ) : chats.length > 0 ? (
          chats.map((chat) => {
            const chatId = chat._id;
            const isSelected = selectedChat?._id === chatId;
            const newMessagesCount = newMessageNotifications[chatId] || 0;
            return (
              <div
                key={chatId}
                onClick={() => setSelectedChat(chat)}
                className={`chat-item ${
                  isSelected ? "selected-chat" : newMessagesCount > 0 ? "new-message" : ""
                }`}
              >
                {chat.participants
                  ?.filter((p) => p._id !== userInfo?._id)
                  .map((p) => p.name)
                  .join(", ") || "Sin participantes"}
                {newMessagesCount > 0 && (
                  <span className="notification-badge">{newMessagesCount}</span>
                )}
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

      <div className="chat-box">
        {selectedChat ? (
          <>
            <h2 className="chat-header">
              Chat con{" "}
              {selectedChat.participants
                ?.filter((p) => p._id !== userInfo?._id)
                .map((p) => p.name)
                .join(", ") || "Sin participantes"}
            </h2>
            <div className="messages">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isSentByUser = msg.sender?._id === userInfo?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`message ${
                        isSentByUser ? "sent-message" : "received-message"
                      }`}
                    >
                      {msg.content}
                    </div>
                  );
                })
              ) : (
                <p>No hay mensajes aún</p>
              )}
            </div>
            <div className="message-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="message-input"
              />
              <button onClick={handleSendMessage} className="send-button">
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

export default ChatScreen;
