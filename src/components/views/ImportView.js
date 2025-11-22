import { UploadCloud, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

export default function ImportView() {
    const { add } = useData();
    const [msg, setMsg] = useState(null);

    const handleImport = (type) => {
        const inputId = `csv-${type}`;
        const input = document.getElementById(inputId);
        
        if (!input.files.length) {
            setMsg({text: 'Seleccione un archivo primero', type: 'error'});
            return;
        }

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const text = e.target.result;
            const rows = text.split('\n').slice(1);
            let addedCount = 0;

            rows.forEach(row => {
                if(!row.trim()) return;
                const cols = row.split(',');
                
                if(type === 'students' && cols.length >= 5) {
                    add('students', {
                        matricula: cols[0].trim(), nombre: cols[1].trim(), apellidoP: cols[2].trim(),
                        apellidoM: cols[3] ? cols[3].trim() : '', email: cols[4].trim(),
                        grado: cols[5] ? cols[5].trim() : 1, grupo: cols[6] ? cols[6].trim() : 'A'
                    });
                    addedCount++;
                }
                else if(type === 'teachers' && cols.length >= 3) {
                    add('teachers', {
                        nombre: cols[0].trim(), email: cols[1].trim(), especialidad: cols[2].trim()
                    });
                    addedCount++;
                }
                else if(type === 'classes' && cols.length >= 4) {
                    add('classes', {
                        codigo: cols[0].trim(), nombre: cols[1].trim(), grado: cols[2].trim(),
                        grupo: cols[3].trim(), maestroId: '', capacidad: 30
                    });
                    addedCount++;
                }
            });

            if(addedCount > 0) {
                setMsg({text: `Se importaron ${addedCount} registros de ${type}.`, type: 'success'});
                input.value = ''; 
            } else {
                setMsg({text: 'Error al leer formato CSV o archivo vacío', type: 'error'});
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <h3><UploadCloud style={{verticalAlign:'middle', marginRight:10}} />Centro de Importación Masiva</h3>
            </div>
            
            <div className="alert-box">
                <AlertTriangle />
                <p><strong>IMPORTANTE:</strong> Para garantizar la integridad de los datos, respete estrictamente el orden de carga.</p>
            </div>

            {msg && (
                <div style={{padding: 10, marginBottom: 20, borderRadius: 8, background: msg.type === 'error' ? '#fee2e2' : '#dcfce7', color: msg.type === 'error' ? '#991b1b' : '#166534'}}>
                    {msg.text}
                </div>
            )}

            <div className="import-grid">
                <div className="import-card">
                    <div className="step-badge">1</div>
                    <h4>Alumnos</h4>
                    <p>Cargue el listado de estudiantes primero.</p>
                    <input type="file" id="csv-students" accept=".csv" className="file-input" />
                    <button className="btn btn-primary w-100" onClick={() => handleImport('students')}>Procesar CSV Alumnos</button>
                </div>

                <div className="import-card">
                    <div className="step-badge">2</div>
                    <h4>Maestros</h4>
                    <p>A continuación, cargue la nómina de docentes.</p>
                    <input type="file" id="csv-teachers" accept=".csv" className="file-input" />
                    <button className="btn btn-primary w-100" onClick={() => handleImport('teachers')}>Procesar CSV Maestros</button>
                </div>

                <div className="import-card">
                    <div className="step-badge">3</div>
                    <h4>Clases / Materias</h4>
                    <p>Finalmente, cargue las clases vinculando a los maestros.</p>
                    <input type="file" id="csv-classes" accept=".csv" className="file-input" />
                    <button className="btn btn-primary w-100" onClick={() => handleImport('classes')}>Procesar CSV Clases</button>
                </div>
            </div>
        </div>
    );
}