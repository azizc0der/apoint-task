import React, {useEffect, useState} from "react";
import axios from "axios";

export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function ReportsPage() {
    const baseUrl = process.env.REACT_APP_APOINT_BASE_URL;
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [collapsed, setCollapsed] = useState({});
    const token = localStorage.getItem("token");

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const fetchTableData = async () => {
        try {
            const res = await axios.get(`${baseUrl}/reports/reports/materials?sort=name&start=${start}&end=${end}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTableData(res.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTableData();
    }, []);

    const toggleCollapse = (key) => {
        setCollapsed(prev => ({...prev, [key]: !prev[key]}));
    };

    const sumFields = (items) => {
        const fields = [
            "remind_start_amount", "remind_start_sum",
            "remind_income_amount", "remind_income_sum",
            "remind_outgo_amount", "remind_outgo_sum",
            "remind_end_amount", "remind_end_sum"
        ];

        return fields.reduce((acc, key) => {
            acc[key] = items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
            return acc;
        }, {});
    };

    const groupData = () => {
        const grouped = {};
        for (const item of tableData) {
            if (!grouped[item.parent]) grouped[item.parent] = {};
            if (!grouped[item.parent][item.category]) grouped[item.parent][item.category] = [];
            grouped[item.parent][item.category].push(item);
        }
        return grouped;
    };

    const grouped = groupData();

    const allItems = Object.values(grouped).flatMap(categories =>
        Object.values(categories).flat()
    );

    const overallTotal = sumFields(allItems);

    if (isLoading) return <div className="p-4">Loading...</div>;

    return (
        <div className="w-[1440px] mx-auto py-[40px]">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-gray-100 p-1">
                    <th rowSpan={2} className="border border-[#ccc] p-1">Наименование</th>
                    <th rowSpan={2} className="border border-[#ccc] p-1">Цвет</th>
                    <th rowSpan={2} className="border border-[#ccc] p-1">Ед изм</th>
                    <th rowSpan={2} className="border border-[#ccc] p-1">Артикул</th>
                    <th rowSpan={2} className="border border-[#ccc] p-1">Цена учетная</th>
                    <th colSpan={2} className="border border-[#ccc] p-1 bg-green-100">Сальдо начало</th>
                    <th colSpan={2} className="border border-[#ccc] p-1 bg-blue-100">Приход</th>
                    <th colSpan={2} className="border border-[#ccc] p-1 bg-red-100">Расход</th>
                    <th colSpan={2} className="border border-[#ccc] p-1 bg-yellow-100">Сальдо конец</th>
                </tr>
                <tr className="bg-gray-50 p-1">
                    <th className="border border-[#ccc] p-1">Кол-во</th>
                    <th className="border border-[#ccc] p-1">Сумма</th>
                    <th className="border border-[#ccc] p-1">Кол-во</th>
                    <th className="border border-[#ccc] p-1">Сумма</th>
                    <th className="border border-[#ccc] p-1">Кол-во</th>
                    <th className="border border-[#ccc] p-1">Сумма</th>
                    <th className="border border-[#ccc] p-1">Кол-во</th>
                    <th className="border border-[#ccc] p-1">Сумма</th>
                </tr>
                </thead>
                <tbody>
                <tr className="bg-blue-200 p-1">
                    <td className="border border-[#ccc] p-1 font-bold">Итог</td>
                    <td className="border border-[#ccc] p-1"></td>
                    <td className="border border-[#ccc] p-1"></td>
                    <td className="border border-[#ccc] p-1"></td>
                    <td className="border border-[#ccc] p-1"></td>
                    <td className="border border-[#ccc] font-bold p-1">{overallTotal.remind_start_amount}</td>
                    <td className="border border-[#ccc] font-bold p-1">{formatNumber(overallTotal.remind_start_sum)}</td>
                    <td className="border border-[#ccc] font-bold p-1">{overallTotal.remind_income_amount}</td>
                    <td className="border border-[#ccc] font-bold p-1">{formatNumber(overallTotal.remind_income_sum)}</td>
                    <td className="border border-[#ccc] font-bold p-1">{overallTotal.remind_outgo_amount}</td>
                    <td className="border border-[#ccc] font-bold p-1">{formatNumber(overallTotal.remind_outgo_sum)}</td>
                    <td className="border border-[#ccc] font-bold p-1">{overallTotal.remind_end_amount}</td>
                    <td className="border border-[#ccc] font-bold p-1">{formatNumber(overallTotal.remind_end_sum)}</td>
                </tr>
                {Object.entries(grouped).map(([parent, categories]) => {
                    const parentItems = tableData.filter(item => item.parent === parent);
                    const parentTotal = sumFields(parentItems);

                    return (
                        <React.Fragment key={parent}>
                            <tr className="bg-blue-100 p-1">
                                <td colSpan={13} className="border border-[#ccc] p-1 font-bold flex items-center gap-2">
                                    <button
                                        className="w-[20px] h-[20px] border border-black rounded"
                                        onClick={(e) => {
                                            toggleCollapse(parent);
                                        }}>
                                        {collapsed[parent] ? "+" : "–"}
                                    </button>
                                    {parent}
                                </td>
                                <td className="border border-[#ccc] p-1"></td>
                                <td className="border border-[#ccc] p-1"></td>
                                <td className="border border-[#ccc] p-1"></td>
                                <td className="border border-[#ccc] p-1"></td>
                                <td className="border border-[#ccc] p-1 font-bold">{parentTotal.remind_start_amount}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{formatNumber(parentTotal.remind_start_sum)}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{parentTotal.remind_income_amount}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{formatNumber(parentTotal.remind_income_sum)}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{parentTotal.remind_outgo_amount}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{formatNumber(parentTotal.remind_outgo_sum)}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{parentTotal.remind_end_amount}</td>
                                <td className="border border-[#ccc] p-1 font-bold">{formatNumber(parentTotal.remind_end_sum)}</td>
                            </tr>

                            {!collapsed[parent] && Object.entries(categories).map(([category, items]) => {
                                const categoryTotal = sumFields(items);

                                return (
                                    <React.Fragment key={`${parent}-${category}`}>
                                        <tr className="bg-blue-50 p-1">
                                            <td colSpan={13}
                                                className="border border-[#ccc] p-1 font-semibold pl-8 flex items-center gap-2">
                                                <button
                                                    className="w-[20px] h-[20px] border border-black rounded"
                                                    onClick={(e) => {
                                                        toggleCollapse(`${parent}-${category}`);
                                                    }}>
                                                    {collapsed[`${parent}-${category}`] ? "+" : "–"}
                                                </button>
                                                {category}
                                            </td>
                                            <td className="border border-[#ccc] p-1"></td>
                                            <td className="border border-[#ccc] p-1"></td>
                                            <td className="border border-[#ccc] p-1"></td>
                                            <td className="border border-[#ccc] p-1"></td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{categoryTotal.remind_start_amount}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{formatNumber(categoryTotal.remind_start_sum)}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{categoryTotal.remind_income_amount}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{formatNumber(categoryTotal.remind_income_sum)}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{categoryTotal.remind_outgo_amount}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{formatNumber(categoryTotal.remind_outgo_sum)}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{categoryTotal.remind_end_amount}</td>
                                            <td className="border border-[#ccc] p-1 font-semibold">{formatNumber(categoryTotal.remind_end_sum)}</td>
                                        </tr>

                                        {!collapsed[`${parent}-${category}`] && items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="border border-[#ccc] p-1 pl-12">
                                                    {i + 1}.
                                                    <span className="pl-[8px] text-[#5d78ff]">{item.name}</span>
                                                </td>
                                                {/* The field was left empty because the color value is null */}
                                                <td className="border border-[#ccc] p-1"></td>
                                                <td className="border border-[#ccc] p-1">{item.unit}</td>
                                                <td className="border border-[#ccc] p-1">{item.code}</td>
                                                <td className="border border-[#ccc] p-1">{formatNumber(item.last_price)}</td>
                                                <td className="border border-[#ccc] p-1">{item.remind_start_amount}</td>
                                                <td className="border border-[#ccc] p-1">{formatNumber(item.remind_start_sum)}</td>
                                                <td className="border border-[#ccc] p-1">{item.remind_income_amount}</td>
                                                <td className="border border-[#ccc] p-1">{formatNumber(item.remind_income_sum)}</td>
                                                <td className="border border-[#ccc] p-1">{item.remind_outgo_amount}</td>
                                                <td className="border border-[#ccc] p-1">{formatNumber(item.remind_outgo_sum)}</td>
                                                <td className="border border-[#ccc] p-1">{item.remind_end_amount}</td>
                                                <td className="border border-[#ccc] p-1">{formatNumber(item.remind_end_sum)}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}