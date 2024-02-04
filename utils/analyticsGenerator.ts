import { Model, Document } from "mongoose";

interface IMonthData {
  month: string;
  count: number;
}
export async function generateLast12MonthData<T extends Document>(
  model: Model<T>
): Promise<{ last12Months: IMonthData[] }> {
  const last12Months: IMonthData[] = [];
  const currentDate = new Date();

  // Iterate through 12 months efficiently using a date-based approach:
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const currentMonth = currentDate.getMonth() - monthIndex;
    const currentYear = currentDate.getFullYear();

    // Adjust for previous years if needed:
    const year = currentMonth < 0 ? currentYear - 1 : currentYear;
    const month = (currentMonth + 12) % 12; // Ensure 0-indexed months

    // Calculate month start and end dates accurately:
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of the month

    const monthYear = startDate.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    last12Months.push({ month: monthYear, count });
  }

  return { last12Months };
}
