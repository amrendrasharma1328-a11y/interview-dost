export default function ListEditor({ fields, form, onChange, legend }) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="sr-only">{legend}</legend>
      {fields.map((f) => (
        <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
          <label htmlFor={`f-${f.key}`} className="label">{f.label}</label>
          {f.single ? (
            <input id={`f-${f.key}`} className="input mt-1" value={form[f.key]} onChange={(e) => onChange({ ...form, [f.key]: e.target.value })} />
          ) : (
            <textarea id={`f-${f.key}`} rows={f.rows || 2} className="input mt-1" value={form[f.key]}
              onChange={(e) => onChange({ ...form, [f.key]: e.target.value })} />
          )}
          {!f.single && <p className="mt-1 text-xs text-slate-600">{f.sep === "," ? "Separate with commas" : "One per line"}</p>}
        </div>
      ))}
    </fieldset>
  );
}
