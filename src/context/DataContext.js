"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        students: [],
        teachers: [],
        classes: [],
        enrollments: [],
        notifications: []
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('conalepData_vNext');
            if (stored) {
                setData(JSON.parse(stored));
            } else {
                generateMockData();
            }
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('conalepData_vNext', JSON.stringify(data));
        }
    }, [data, isLoaded]);

    const generateMockData = () => {
        const names = ["Ana", "Carlos", "Sofia", "Miguel", "Luis", "Elena", "David", "Lucia", "Pablo", "Maria"];
        const lastNames = ["Garcia", "Lopez", "Martinez", "Rodriguez", "Perez", "Sanchez", "Torres", "Ruiz", "Diaz", "Vargas"];
        const subjects = ["Matemáticas", "Historia", "Ciencias", "Literatura", "Arte", "Física", "Química", "Inglés"];

        const students = Array.from({ length: 25 }, (_, i) => ({
            id: `S${1000 + i}`,
            matricula: `2024${1000 + i}`,
            nombre: names[i % 10],
            apellidoP: lastNames[i % 10],
            apellidoM: lastNames[(i + 2) % 10],
            email: `alumno${i + 1}@conalep.edu.mx`,
            curp: `CURP${1000 + i}X`,
            grado: (i % 6) + 1,
            grupo: ['A', 'B'][i % 2],
        }));

        const teachers = Array.from({ length: 8 }, (_, i) => ({
            id: `T${2000 + i}`,
            nombre: names[(i + 5) % 10] + " " + lastNames[(i + 3) % 10],
            email: `docente${i + 1}@conalep.edu.mx`,
            telefono: '555-999-9999',
            especialidad: subjects[i % 8],
        }));

        const classes = Array.from({ length: 12 }, (_, i) => ({
            id: `C${3000 + i}`,
            codigo: `${subjects[i % 8].substring(0, 3).toUpperCase()}${400 + i}-${['A', 'B'][i % 2]}`,
            nombre: subjects[i % 8],
            grado: (i % 6) + 1,
            grupo: ['A', 'B'][i % 2],
            maestroId: teachers[i % 8].id,
            horario: "08:00 - 10:00",
            capacidad: 30,
        }));

        const enrollments = [];
        classes.forEach(cls => {
            for (let k = 0; k < 5; k++) {
                enrollments.push({
                    id: `E${Date.now()}${k}${cls.id}`,
                    alumnoId: students[k % 25].id,
                    materiaId: cls.id,
                    fecha: '2024-01-15'
                });
            }
        });

        const notifications = Array.from({ length: 8 }, (_, i) => ({
            id: `N${5000 + i}`,
            titulo: `Aviso Escolar ${i + 1}`,
            mensaje: "Este es el cuerpo completo del mensaje...",
            destinatarios: "Todos",
            fecha: '2024-03-20',
            estado: ['Pendiente', 'Aprobada', 'Rechazada'][i % 3]
        }));

        setData({ students, teachers, classes, enrollments, notifications });
    };

    const add = (entity, item) => {
        const newItem = { ...item, id: Date.now().toString() + Math.floor(Math.random() * 1000) };
        setData(prev => ({
            ...prev,
            [entity]: [newItem, ...prev[entity]]
        }));
    };

    const update = (entity, id, updatedFields) => {
        setData(prev => ({
            ...prev,
            [entity]: prev[entity].map(item => item.id === id ? { ...item, ...updatedFields } : item)
        }));
    };

    const remove = (entity, id) => {
        setData(prev => ({
            ...prev,
            [entity]: prev[entity].filter(item => item.id !== id)
        }));
    };

    return (
        <DataContext.Provider value={{ data, add, update, remove, generateMockData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);