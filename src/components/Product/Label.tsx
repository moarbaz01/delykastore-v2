interface LabelProps {
  text: string;
  number: number | string;
}

const Label = ({ text, number }: LabelProps) => {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: "linear-gradient(135deg, #E55577, #FF7597)" }}
      >
        {number}
      </div>
      <h2 className="font-semibold text-sm text-gray-700">{text}</h2>
    </div>
  );
};

export default Label;
