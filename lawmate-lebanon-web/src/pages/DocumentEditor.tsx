import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { documentsAPI } from '@/services/api';

const DocumentEditor = () => {
  const { id } = useParams();
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
    <div>
      <h1>{doc.title}</h1>
      <pre>{doc.content}</pre>
    </div>
  );
};

export default DocumentEditor;



