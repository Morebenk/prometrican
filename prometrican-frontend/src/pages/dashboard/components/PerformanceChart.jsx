import { Card, CardContent, Typography, Box } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceChart = ({ data }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: "Score",
        data: data.scores || [],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Score (%)",
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Trend
        </Typography>
        {data.scores?.length > 0 ? (
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={options} />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography color="textSecondary">
              No performance data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
