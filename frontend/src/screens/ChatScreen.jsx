import React, { useState, useEffect } from "react";
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
let socket;

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
  const [createChat] = useCreateChatMutation(); // Para crear un nuevo chat

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Conectar a Socket.IO
  useEffect(() => {
    if (userInfo) {
      socket = io(ENDPOINT);
      socket.emit("setup", userInfo);
      socket.on("connected", () => setSocketConnected(true));

      // Escuchar mensajes nuevos desde el servidor
      socket.on("messageReceived", (newMessageReceived) => {
        if (selectedChat && newMessageReceived.chat === selectedChat._id) {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [userInfo, selectedChat]);

  // Obtener mensajes del chat seleccionado
  const {
    data: chatMessages = [],
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useGetMessagesQuery(selectedChat?._id, {
    skip: !selectedChat,
  });

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  // Unirse a un chat cuando es seleccionado
  useEffect(() => {
    if (selectedChat && selectedChat._id && socketConnected) {
      socket.emit("joinChat", selectedChat._id);
      refetchMessages(); // Refrescar mensajes
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
      await sendMessage(messageData).unwrap(); // Guardar mensaje en la base de datos
      setNewMessage("");
      toast.success("Mensaje enviado");
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
      const chat = await createChat({ participantId }).unwrap(); // Crear un nuevo chat
      setSelectedChat(chat);
      refetchChats(); // Refrescar la lista de chats
      toast.success("Chat iniciado con éxito");
    } catch (error) {
      toast.error("Error al iniciar el chat");
    }
  };

  // Validar la lista de pacientes y médicos para el rol de administrador o médico
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
          chats.map((chat) => (
            <div
              key={chat?._id}
              onClick={() => setSelectedChat(chat)}
              style={{
                ...styles.chatItem,
                backgroundColor:
                  selectedChat?._id === chat?._id ? "#f0f0f0" : "#fff",
              }}
            >
              {chat.participants
                ?.filter((p) => p._id !== userInfo?._id)
                .map((p) => p.name)
                .join(", ") || "Sin participantes"}
            </div>
          ))
        ) : (
          <p>No hay chats disponibles</p>
        )}

        {/* Mostrar la lista de participantes (pacientes y médicos) para el admin y el doctor */}
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
                messages
                  .filter((msg) => msg != null) // Filtrar mensajes nulos
                  .map((msg) => (
                    <div key={msg?._id} style={styles.message}>
                      <strong>{msg?.sender?.name || "Sin nombre"}: </strong>{" "}
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
};

export default ChatScreen;
