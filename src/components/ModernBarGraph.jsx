import { useEffect, useState } from "react";

const ModernBarGraph = ({ data, orientation = "horizontal" }) => {
    const [animatedPercentages, setAnimatedPercentages] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedPercentages(prev =>
                data.map((d, i) =>
                    Math.min((prev?.[i] || 0) + 1, d.percentage)
                )
            );
        }, 20);

        return () => clearInterval(interval);
    }, [data]);

    return (
        <div className="p-6">
            {orientation === "horizontal" ? (
                <div>
                    {data.map((dept, index) => {
                        const name = dept.name
                            ?.split("_")
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ");
                        const percent = animatedPercentages[index] || 0;
                        return (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-700 font-medium">{name}</span>
                                    <span className="text-sm text-gray-500">{percent}%</span>
                                </div>
                                <div className="relative w-full bg-gray-100 h-4 rounded-xl overflow-hidden">
                                    <div
                                        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-in-out bg-gradient-to-r from-blue-400 via-${dept.color.replace("bg-", "")} to-blue-600`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex items-end gap-6 w-full h-[300px] overflow-x-auto">
                    {data.map((dept, index) => {
                        const name = dept.name
                            ?.split("_")
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ");
                        const percent = animatedPercentages[index] || 0;
                        return (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className={`w-10 rounded-t-xl transform origin-bottom transition-transform duration-700 bg-gradient-to-t ${getGradientClass(dept.color)}`}
                                    style={{
                                        transform: `scaleY(${percent / 100})`,
                                        height: "250px",
                                    }}
                                ></div>
                                <span className="text-sm mt-2 text-center text-gray-600 w-[100px] truncate">{name}</span>
                                <span className="text-xs text-gray-400">{percent}%</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
const getGradientClass = (color) => {
    const map = {
        "bg-green-500": "from-green-400 via-green-500 to-green-600",
        "bg-blue-500": "from-blue-400 via-blue-500 to-blue-600",
        "bg-purple-500": "from-purple-400 via-purple-500 to-purple-600",
        "bg-yellow-500": "from-yellow-400 via-yellow-500 to-yellow-600",
        "bg-pink-500": "from-pink-400 via-pink-500 to-pink-600",
        "bg-indigo-500": "from-indigo-400 via-indigo-500 to-indigo-600",
    };
    return map[color] || "from-gray-300 via-gray-400 to-gray-500";
};

export default ModernBarGraph;
