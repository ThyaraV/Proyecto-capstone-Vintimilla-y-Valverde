import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetChatsQuery,
  useSendMessageMutation,
} from "../slices/chatApiSlice";
import { useGetPatientsQuery } from "../slices/patientApiSlice";

const ChatScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Asegurar valores predeterminados para evitar errores
  const { data: chats = [], isLoading: loadingChats } = useGetChatsQuery();
  const { data: patients = [], isLoading: loadingPatients } =
    useGetPatientsQuery();

  const [sendMessage] = useSendMessageMutation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      await sendMessage({ chatId: selectedChat._id, content: newMessage });
      setNewMessage("");
    }
  };

  // Validar la lista de pacientes para el rol de administrador o médico
  const renderPatientsDropdown = () => {
    if (loadingPatients) {
      return <p>Cargando pacientes...</p>;
    }
    if (patients.length === 0) {
      return <p>No hay pacientes disponibles</p>;
    }

    return (
      <select onChange={(e) => setSelectedChat(e.target.value)}>
        <option value="">Selecciona un paciente</option>
        {patients.map((patient) => (
          <option key={patient._id} value={patient._id}>
            {patient.user?.name || "Paciente sin nombre"}
          </option>
        ))}
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
          chats.map((chat) => (
            <div key={chat._id} onClick={() => setSelectedChat(chat)}>
              {chat.participants?.map((p) => p.name).join(", ") ||
                "Sin participantes"}
            </div>
          ))
        ) : (
          <p>No hay chats disponibles</p>
        )}

        {userInfo?.isAdmin && renderPatientsDropdown()}
      </div>

      <div className="chat-box">
        {selectedChat ? (
          <>
            <h2>
              Chat con{" "}
              {selectedChat.participants?.map((p) => p.name).join(", ")}
            </h2>
            <div className="messages">
              {selectedChat.messages?.map((msg) => (
                <div key={msg._id}>
                  <strong>{msg.sender.name}: </strong> {msg.content}
                </div>
              )) || <p>No hay mensajes aún</p>}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </>
        ) : (
          <p>Selecciona un chat para comenzar</p>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
