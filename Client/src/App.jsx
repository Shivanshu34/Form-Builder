import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';
import FillPage from './pages/FillPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/preview/:shareId" element={<PreviewPage />} />
        <Route path="/fill/:shareId" element={<FillPage />} />

        <Route path="*" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}