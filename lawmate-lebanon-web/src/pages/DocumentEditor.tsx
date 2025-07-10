import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { documentsAPI } from '@/services/api';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await documentsAPI.getDocument(id);
        setDoc(response.data);
      } catch (e) {
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!doc) return <div>Document not found or you do not have access.</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
      >
        ← 
      </button>

      <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{doc.content}</pre>
    </div>
  );
};

export default DocumentEditor;
