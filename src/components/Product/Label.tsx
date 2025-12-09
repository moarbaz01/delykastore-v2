interface LabelProps {
  number: string | number;
  text: string;
}

const Label = ({ number, text }: LabelProps) => {
  return (
    <div className="flex items-center w-fit h-auto gap-2 text-white rounded-3xl">
      <div className="bg-primary text-black font-bold rounded-full h-8 w-8 flex items-center justify-center">
        {number}
      </div>
      <h1 className="text-lg text-white">{text}</h1>
    </div>
  );
};

export default Label;
