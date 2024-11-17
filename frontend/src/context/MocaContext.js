import React, { createContext, useState, useContext } from 'react';

const MocaContext = createContext();

export const useMoca = () => useContext(MocaContext);

export const MocaProvider = ({ children }) => {
  const [totalScore, setTotalScore] = useState(0);
  const [responses, setResponses] = useState({});

  const updateScore = (points) => {
    setTotalScore((prevScore) => prevScore + points);
  };

  const saveResponse = (module, response) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [module]: response,
    }));
  };

  return (
    <MocaContext.Provider value={{ totalScore, responses, updateScore, saveResponse }}>
      {children}
    </MocaContext.Provider>
  );
};
