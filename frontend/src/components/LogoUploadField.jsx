import { fileToDataUrl } from '../utils/fileToDataUrl';

export default function LogoUploadField({ value, onChange }) {
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Please choose an image under 500KB');
      return;
    }
    onChange(await fileToDataUrl(file));
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
        {value ? <img src={value} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-slate-300 text-xs">Logo</span>}
      </div>
      <label className="flex-1 text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:border-brand-400 hover:text-brand-600 transition">
        {value ? 'Change organization logo' : 'Upload organization logo (optional)'}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}
