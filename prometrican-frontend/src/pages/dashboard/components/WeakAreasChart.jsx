import { Card, CardContent, Typography, Box } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const WeakAreasChart = ({ weakAreas }) => {
  const chartData = {
    labels: weakAreas.map((area) => area.categoryName),
    datasets: [
      {
        data: weakAreas.map((area) => area.totalWrongAnswers),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Areas for Improvement
        </Typography>
        {weakAreas.length > 0 ? (
          <Box sx={{ height: 300 }}>
            <Doughnut data={chartData} options={options} />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography color="textSecondary">
              No weak areas data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WeakAreasChart;
