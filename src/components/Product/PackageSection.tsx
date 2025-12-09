import CostItem from "./CostItem";
import Label from "./Label";

interface PackageSectionProps {
  groupedCost: Array<{
    category: string;
    items: Array<{
      id: string;
      amount: string;
      price: string;
      image?: string;
      note?: string;
      category?: string;
    }>;
  }>;
  amountSelected: {
    id: string;
    amount: string;
    price: string;
  };
  setAmountSelected: (value: any) => void;
}

const PackageSection = ({
  groupedCost,
  amountSelected,
  setAmountSelected,
}: PackageSectionProps) => {
  return (
    <div className="p-4 rounded-lg border bg-secondary border-gray-600 relative">
      <Label text={"ជ្រើសរើសកញ្ចប់ ពេជ្រ"} number={2} />
      {groupedCost.map((item, index) => (
        <div key={index} className="mt-4">
          {item.category !== "no_category" && item.items.length !== 0 && (
            <div className="text-primary flex items-center mt-2 gap-2 rounded-lg w-fit">
              <h1 className="font-bold text-lg">{item.category}</h1>
            </div>
          )}

          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6 mt-4">
            {item.items.map((item, i) => (
              <CostItem
                key={item.id}
                item={item}
                i={i}
                amountSelected={amountSelected}
                setAmountSelected={setAmountSelected}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PackageSection;
