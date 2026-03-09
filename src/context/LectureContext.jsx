import React, { createContext, useState } from 'react';

export const LectureContext = createContext();

export const LectureProvider = ({ children }) => {
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);

  const addLecture = (lecture) => {
    setLectures([...lectures, { ...lecture, id: Date.now() }]);
  };

  const updateLecture = (id, updates) => {
    setLectures(lectures.map(lec => lec.id === id ? { ...lec, ...updates } : lec));
  };

  const deleteLecture = (id) => {
    setLectures(lectures.filter(lec => lec.id !== id));
  };

  return (
    <LectureContext.Provider value={{
      lectures,
      currentLecture,
      setCurrentLecture,
      addLecture,
      updateLecture,
      deleteLecture
    }}>
      {children}
    </LectureContext.Provider>
  );
};