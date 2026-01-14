import { FaShieldAlt, FaHeadset, FaBolt, FaGift, FaChartLine, FaUsers, FaTag, FaWallet } from "react-icons/fa";

const features = [
    {
        icon: FaTag,
        title: "តម្លៃសមរម្យ",
        description: "តែងតែផ្តល់នូវផលិតផលដែលមានគុណភាពល្អ ក្នុងតម្លៃទាបបំផុតសម្រាប់ហ្គេមដែលមានទាំងអស់"
    },
    {
        icon: FaWallet,
        title: "ជម្រើសទូទាត់ប្រាក់",
        description: "ជម្រើសទូទាត់ប្រាក់មានច្រើនប្រភេទឲ្យជ្រើសរើសមានដូចជា KHQR, WING, ABA, ACLEDA..."
    },
    {
        icon: FaGift,
        title: "ការផ្តល់ជូនពិសេស",
        description: "តែងតែមានការផ្តល់ជូនពិសេសៗទៅកាន់អតិថិជន ក៏ដូចជាមានការចាប់រង្វាន់រៀងរាល់ខែ"
    },
    {
        icon: FaBolt,
        title: "សេវាកម្មរហ័ស",
        description: "សេវាកម្ម និងការដឹកជញ្ជូនឆាប់រហ័សរាល់ការជាវនូវគ្រប់ផលិតផល"
    },
    {
        icon: FaShieldAlt,
        title: "សុវត្តិភាព និង ទំនុកចិត្ត",
        description: "ការរក្សាបាននូវសុត្ថិភាព និងទំនុកចិត្តខ្ពស់សម្រាប់គណនីផ្ទាល់ខ្លួនរបស់អ្នក"
    }
];

export default function WhyChooseUs() {
    return (
        <section className="py-16 px-4  ">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        ហេតុអ្វីត្រូវជ្រើសរើសយើង
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        យើងផ្តល់ជូននូវបទពិសោធន៍ល្បែងល្អបំផុតជាមួយនឹងលក្ខណៈពិសេស និងអត្ថប្រយោជន៍ដែលគ្មានអ្នកណាអាចប្រៀបផ្ទឹមបាន
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-secondary border border-gray-600/30 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-105 group"
                            >
                                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors duration-300">
                                    <Icon className="text-2xl text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
