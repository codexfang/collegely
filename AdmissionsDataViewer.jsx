import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Complete university dataset
const sampleAdmissionsData = [
  // Ivy League (all 8 members)
  { name: "Harvard University", name_zh: "哈佛大学", admission_rate: 0.05, category: "Ivy League" },
  { name: "Yale University", name_zh: "耶鲁大学", admission_rate: 0.06, category: "Ivy League" },
  { name: "Princeton University", name_zh: "普林斯顿大学", admission_rate: 0.065, category: "Ivy League" },
  { name: "Columbia University", name_zh: "哥伦比亚大学", admission_rate: 0.055, category: "Ivy League" },
  { name: "University of Pennsylvania", name_zh: "宾夕法尼亚大学", admission_rate: 0.074, category: "Ivy League" },
  { name: "Brown University", name_zh: "布朗大学", admission_rate: 0.072, category: "Ivy League" },
  { name: "Dartmouth College", name_zh: "达特茅斯学院", admission_rate: 0.088, category: "Ivy League" },
  { name: "Cornell University", name_zh: "康奈尔大学", admission_rate: 0.108, category: "Ivy League" },
  
  // UC System (9 undergraduate campuses)
  { name: "UC Berkeley", name_zh: "加州大学伯克利分校", admission_rate: 0.17, category: "UC" },
  { name: "UCLA", name_zh: "加州大学洛杉矶分校", admission_rate: 0.14, category: "UC" },
  { name: "UC San Diego", name_zh: "加州大学圣地亚哥分校", admission_rate: 0.34, category: "UC" },
  { name: "UC Davis", name_zh: "加州大学戴维斯分校", admission_rate: 0.46, category: "UC" },
  { name: "UC Irvine", name_zh: "加州大学欧文分校", admission_rate: 0.29, category: "UC" },
  { name: "UC Santa Barbara", name_zh: "加州大学圣塔芭芭拉分校", admission_rate: 0.37, category: "UC" },
  { name: "UC Santa Cruz", name_zh: "加州大学圣克鲁兹分校", admission_rate: 0.65, category: "UC" },
  { name: "UC Riverside", name_zh: "加州大学河滨分校", admission_rate: 0.68, category: "UC" },
  { name: "UC Merced", name_zh: "加州大学默塞德分校", admission_rate: 0.72, category: "UC" },
  
  // CSU System (selected campuses)
  { name: "San Diego State", name_zh: "圣地亚哥州立大学", admission_rate: 0.37, category: "CSU" },
  { name: "San Jose State", name_zh: "圣何塞州立大学", admission_rate: 0.64, category: "CSU" },
  { name: "Cal Poly San Luis Obispo", name_zh: "加州理工州立大学", admission_rate: 0.38, category: "CSU" },
  { name: "Cal State Long Beach", name_zh: "加州州立大学长滩分校", admission_rate: 0.47, category: "CSU" },
  { name: "Cal State Fullerton", name_zh: "加州州立大学富勒顿分校", admission_rate: 0.53, category: "CSU" },
  { name: "Cal Poly Pomona", name_zh: "加州州立理工大学波莫纳", admission_rate: 0.55, category: "CSU" },
  { name: "San Francisco State", name_zh: "旧金山州立大学", admission_rate: 0.67, category: "CSU" },
  { name: "Sacramento State", name_zh: "萨克拉门托州立大学", admission_rate: 0.82, category: "CSU" },
  
  // Private Universities
  { name: "Stanford University", name_zh: "斯坦福大学", admission_rate: 0.047, category: "Private" },
  { name: "MIT", name_zh: "麻省理工学院", admission_rate: 0.068, category: "Private" },
  { name: "University of Chicago", name_zh: "芝加哥大学", admission_rate: 0.07, category: "Private" },
  { name: "Duke University", name_zh: "杜克大学", admission_rate: 0.085, category: "Private" },
  { name: "Caltech", name_zh: "加州理工学院", admission_rate: 0.06, category: "Private" },
  { name: "Northwestern University", name_zh: "西北大学", admission_rate: 0.09, category: "Private" },
  { name: "Johns Hopkins University", name_zh: "约翰霍普金斯大学", admission_rate: 0.11, category: "Private" },
  { name: "USC", name_zh: "南加州大学", admission_rate: 0.16, category: "Private" },
  { name: "NYU", name_zh: "纽约大学", admission_rate: 0.21, category: "Private" },
  { name: "Boston University", name_zh: "波士顿大学", admission_rate: 0.22, category: "Private" }
];

const sampleCostData = [
  // Ivy League
  { name: "Harvard University", inState: 55000, outState: 55000, avgAid: 30000, category: "Ivy League" },
  { name: "Yale University", inState: 57000, outState: 57000, avgAid: 31000, category: "Ivy League" },
  { name: "Princeton University", inState: 53000, outState: 53000, avgAid: 35000, category: "Ivy League" },
  { name: "Columbia University", inState: 61000, outState: 61000, avgAid: 29000, category: "Ivy League" },
  { name: "University of Pennsylvania", inState: 56000, outState: 56000, avgAid: 28000, category: "Ivy League" },
  { name: "Brown University", inState: 58000, outState: 58000, avgAid: 27000, category: "Ivy League" },
  { name: "Dartmouth College", inState: 57000, outState: 57000, avgAid: 26000, category: "Ivy League" },
  { name: "Cornell University", inState: 59000, outState: 59000, avgAid: 32000, category: "Ivy League" },
  
 // UC System
  { name: "UC Berkeley", inState: 15000, outState: 44000, avgAid: 18000, category: "UC" },
  { name: "UCLA", inState: 14000, outState: 43000, avgAid: 17000, category: "UC" },
  { name: "UC San Diego", inState: 17000, outState: 43000, avgAid: 16000, category: "UC" },
  { name: "UC Davis", inState: 15000, outState: 42000, avgAid: 15000, category: "UC" },
  { name: "UC Irvine", inState: 14000, outState: 43000, avgAid: 14000, category: "UC" },
  { name: "UC Santa Barbara", inState: 15000, outState: 42000, avgAid: 13000, category: "UC" },
  
  // CSU System
  { name: "San Diego State", inState: 8000, outState: 20000, avgAid: 9000, category: "CSU" },
  { name: "San Jose State", inState: 8000, outState: 20000, avgAid: 8000, category: "CSU" },
  { name: "Cal Poly San Luis Obispo", inState: 11000, outState: 30000, avgAid: 10000, category: "CSU" },
  { name: "Cal State Long Beach", inState: 7000, outState: 19000, avgAid: 7000, category: "CSU" },
  
  // Private Universities
  { name: "Stanford University", inState: 56000, outState: 56000, avgAid: 32000, category: "Private" },
  { name: "MIT", inState: 54000, outState: 54000, avgAid: 29000, category: "Private" },
  { name: "University of Chicago", inState: 58000, outState: 58000, avgAid: 28000, category: "Private" },
  { name: "Duke University", inState: 57000, outState: 57000, avgAid: 27000, category: "Private" },
  { name: "Caltech", inState: 55000, outState: 55000, avgAid: 30000, category: "Private" },
  { name: "USC", inState: 58000, outState: 58000, avgAid: 25000, category: "Private" }
];

const sampleOutcomesData = [
  // Ivy League
  { name: "Harvard University", gradRate: 0.98, employmentRate: 0.95, category: "Ivy League" },
  { name: "Yale University", gradRate: 0.95, employmentRate: 0.91, category: "Ivy League" },
  { name: "Princeton University", gradRate: 0.97, employmentRate: 0.92, category: "Ivy League" },
  { name: "Columbia University", gradRate: 0.96, employmentRate: 0.90, category: "Ivy League" },
  { name: "University of Pennsylvania", gradRate: 0.96, employmentRate: 0.93, category: "Ivy League" },
  { name: "Brown University", gradRate: 0.95, employmentRate: 0.90, category: "Ivy League" },
  { name: "Dartmouth College", gradRate: 0.96, employmentRate: 0.94, category: "Ivy League" },
  { name: "Cornell University", gradRate: 0.94, employmentRate: 0.92, category: "Ivy League" },
  
  // UC System
  { name: "UC Berkeley", gradRate: 0.93, employmentRate: 0.89, category: "UC" },
  { name: "UCLA", gradRate: 0.91, employmentRate: 0.88, category: "UC" },
  { name: "UC San Diego", gradRate: 0.86, employmentRate: 0.85, category: "UC" },
  { name: "UC Davis", gradRate: 0.85, employmentRate: 0.84, category: "UC" },
  { name: "UC Irvine", gradRate: 0.84, employmentRate: 0.83, category: "UC" },
  
  // CSU System
  { name: "San Diego State", gradRate: 0.74, employmentRate: 0.82, category: "CSU" },
  { name: "San Jose State", gradRate: 0.65, employmentRate: 0.80, category: "CSU" },
  { name: "Cal Poly San Luis Obispo", gradRate: 0.81, employmentRate: 0.85, category: "CSU" },
  { name: "Cal State Long Beach", gradRate: 0.67, employmentRate: 0.79, category: "CSU" },
  
  // Private Universities
  { name: "Stanford University", gradRate: 0.97, employmentRate: 0.94, category: "Private" },
  { name: "MIT", gradRate: 0.96, employmentRate: 0.93, category: "Private" },
  { name: "University of Chicago", gradRate: 0.94, employmentRate: 0.91, category: "Private" },
  { name: "Duke University", gradRate: 0.95, employmentRate: 0.92, category: "Private" },
  { name: "Caltech", gradRate: 0.93, employmentRate: 0.90, category: "Private" }
];

const sampleMajorsData = [
  // Ivy League
  { name: "Harvard University", facultyStudentRatio: 1/7, category: "Ivy League" },
  { name: "Yale University", facultyStudentRatio: 1/6, category: "Ivy League" },
  { name: "Princeton University", facultyStudentRatio: 1/7, category: "Ivy League" },
  { name: "Columbia University", facultyStudentRatio: 1/8, category: "Ivy League" },
  { name: "University of Pennsylvania", facultyStudentRatio: 1/9, category: "Ivy League" },
  { name: "Brown University", facultyStudentRatio: 1/8, category: "Ivy League" },
  { name: "Dartmouth College", facultyStudentRatio: 1/7, category: "Ivy League" },
  { name: "Cornell University", facultyStudentRatio: 1/10, category: "Ivy League" },
  
  // UC System
  { name: "UC Berkeley", facultyStudentRatio: 1/18, category: "UC" },
  { name: "UCLA", facultyStudentRatio: 1/17, category: "UC" },
  { name: "UC San Diego", facultyStudentRatio: 1/19, category: "UC" },
  { name: "UC Davis", facultyStudentRatio: 1/20, category: "UC" },
  { name: "UC Irvine", facultyStudentRatio: 1/18, category: "UC" },
  
  // CSU System
  { name: "San Diego State", facultyStudentRatio: 1/22, category: "CSU" },
  { name: "San Jose State", facultyStudentRatio: 1/23, category: "CSU" },
  { name: "Cal Poly San Luis Obispo", facultyStudentRatio: 1/19, category: "CSU" },
  { name: "Cal State Long Beach", facultyStudentRatio: 1/21, category: "CSU" },
  
  // Private Universities
  { name: "Stanford University", facultyStudentRatio: 1/5, category: "Private" },
  { name: "MIT", facultyStudentRatio: 1/8, category: "Private" },
  { name: "University of Chicago", facultyStudentRatio: 1/6, category: "Private" },
  { name: "Duke University", facultyStudentRatio: 1/7, category: "Private" },
  { name: "Caltech", facultyStudentRatio: 1/3, category: "Private" }
];

const sampleDemographicsData = [
  // Ivy League
  {
    name: "Harvard University",
    demographics: { White: 0.42, Asian: 0.22, Black: 0.10, Hispanic: 0.12, Other: 0.14 },
    category: "Ivy League"
  },
  {
    name: "Yale University",
    demographics: { White: 0.45, Asian: 0.20, Black: 0.09, Hispanic: 0.11, Other: 0.15 },
    category: "Ivy League"
  },
  {
    name: "Princeton University",
    demographics: { White: 0.41, Asian: 0.23, Black: 0.08, Hispanic: 0.14, Other: 0.14 },
    category: "Ivy League"
  },
  {
    name: "Columbia University",
    demographics: { White: 0.38, Asian: 0.25, Black: 0.10, Hispanic: 0.15, Other: 0.12 },
    category: "Ivy League"
  },
  
  // UC System
  {
    name: "UC Berkeley",
    demographics: { White: 0.30, Asian: 0.35, Black: 0.05, Hispanic: 0.20, Other: 0.10 },
    category: "UC"
  },
  {
    name: "UCLA",
    demographics: { White: 0.28, Asian: 0.33, Black: 0.06, Hispanic: 0.22, Other: 0.11 },
    category: "UC"
  },
  {
    name: "UC San Diego",
    demographics: { White: 0.25, Asian: 0.38, Black: 0.04, Hispanic: 0.20, Other: 0.13 },
    category: "UC"
  },
  
  // CSU System
  {
    name: "San Diego State",
    demographics: { White: 0.35, Asian: 0.15, Black: 0.08, Hispanic: 0.35, Other: 0.07 },
    category: "CSU"
  },
  {
    name: "San Jose State",
    demographics: { White: 0.25, Asian: 0.30, Black: 0.07, Hispanic: 0.30, Other: 0.08 },
    category: "CSU"
  },
  
  // Private Universities
  {
    name: "Stanford University",
    demographics: { White: 0.40, Asian: 0.25, Black: 0.08, Hispanic: 0.15, Other: 0.12 },
    category: "Private"
  },
  {
    name: "MIT",
    demographics: { White: 0.35, Asian: 0.35, Black: 0.07, Hispanic: 0.13, Other: 0.10 },
    category: "Private"
  }
];

const translations = {
  zh: {
    "Admission Rates": "录取率",
    "Cost of Attendance": "就读成本",
    "Student Outcomes": "学生成果",
    "Faculty Ratios": "师生比例",
    "Demographics & Diversity": "人口统计与多样性",
    "Previous College": "上一所大学",
    "Next College": "下一所大学",
    "Graduation Rate (%)": "毕业率 (%)",
    "Employment Rate (%)": "就业率 (%)",
    "Faculty-to-Student Ratio (Students per Faculty)": "师生比 (每位教师对应的学生数)",
    "Percentage": "百分比",
    "All Colleges": "所有大学",
    "Ivy League": "常春藤联盟",
    "UC System": "加州大学系统",
    "CSU System": "加州州立大学系统",
    "Private": "私立大学",
    "Filter by": "筛选",
    "Student Demographics (%)": "学生人口统计 (%)",
  }
};

const categories = ["All Colleges", "Ivy League", "UC System", "CSU System", "Private"];

export default function CollegeDashboard({ language = "en" }) {
  const [activeDataset, setActiveDataset] = useState("admissions");
  const [demographicsIndex, setDemographicsIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All Colleges");

  const t = (key) => translations[language]?.[key] || key;

  const filterData = (data) => {
    if (activeCategory === "All Colleges") return data;
    return data.filter(item => {
      if (activeCategory === "UC System") return item.category === "UC";
      if (activeCategory === "CSU System") return item.category === "CSU";
      return item.category === activeCategory;
    });
  };

  const renderAdmissionsChart = () => {
    const filteredData = filterData(sampleAdmissionsData);
    const labels = filteredData.map((d) =>
      language === "zh" ? d.name_zh : d.name
    );
    const data = filteredData.map((d) => d.admission_rate * 100);

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: t("Admission Rate (%)"),
                data,
                backgroundColor: "rgba(75,192,192,0.5)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { font: { size: 14 }, maxRotation: 60, minRotation: 60 },
              },
            },
          }}
        />
      </div>
    );
  };

  const renderCostChart = () => {
    const filteredData = filterData(sampleCostData);
    const labels = filteredData.map((d) => 
      language === "zh" ? sampleAdmissionsData.find(a => a.name === d.name)?.name_zh || d.name : d.name
    );
    const inState = filteredData.map((d) => d.inState);
    const outState = filteredData.map((d) => d.outState);
    const aid = filteredData.map((d) => d.avgAid);

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "In-State Tuition",
                data: inState,
                backgroundColor: "rgba(54,162,235,0.5)",
              },
              {
                label: "Out-of-State Tuition",
                data: outState,
                backgroundColor: "rgba(255,99,132,0.5)",
              },
              {
                label: "Average Financial Aid",
                data: aid,
                backgroundColor: "rgba(75,192,192,0.5)",
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>
    );
  };

  const renderOutcomesCharts = () => {
    const filteredData = filterData(sampleOutcomesData);
    const names = filteredData.map((d) => 
      language === "zh" ? sampleAdmissionsData.find(a => a.name === d.name)?.name_zh || d.name : d.name
    );
    const gradRates = filteredData.map((d) => d.gradRate * 100);
    const employmentRates = filteredData.map((d) => d.employmentRate * 100);

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar
          data={{
            labels: names,
            datasets: [
              {
                label: t("Graduation Rate (%)"),
                data: gradRates,
                backgroundColor: "rgba(153,102,255,0.5)",
              },
              {
                label: t("Employment Rate (%)"),
                data: employmentRates,
                backgroundColor: "rgba(255,206,86,0.5)",
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>
    );
  };

  const renderFacultyRatiosChart = () => {
    const filteredData = filterData(sampleMajorsData);
    const names = filteredData.map((d) => 
      language === "zh" ? sampleAdmissionsData.find(a => a.name === d.name)?.name_zh || d.name : d.name
    );
    const ratios = filteredData.map(
      (d) => Math.round(1 / d.facultyStudentRatio)
    );

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar
          data={{
            labels: names,
            datasets: [
              {
                label: t("Faculty-to-Student Ratio (Students per Faculty)"),
                data: ratios,
                backgroundColor: "rgba(99,255,132,0.5)",
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>
    );
  };

  const renderDemographicsChart = () => {
    const filteredData = filterData(sampleDemographicsData);
    const college = filteredData[demographicsIndex % filteredData.length];
    if (!college) return null;

    const labels = Object.keys(college.demographics);
    const values = labels.map((key) => college.demographics[key] * 100);

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">
          {language === "zh" 
            ? sampleAdmissionsData.find(a => a.name === college.name)?.name_zh || college.name 
            : college.name} - {t("Student Demographics (%)")}
        </h3>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: t("Percentage"),
                data: values,
                backgroundColor: labels.map(
                  (_, i) => `hsla(${i * 70}, 70%, 50%, 0.6)`
                ),
              },
            ],
          }}
          options={{ responsive: true }}
        />
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() =>
              setDemographicsIndex(
                (prev) => (prev - 1 + filteredData.length) % filteredData.length
              )
            }
            className="college-nav-button"
          >
            {t("Previous College")}
          </button>
          <button
            onClick={() =>
              setDemographicsIndex(
                (prev) => (prev + 1) % filteredData.length
              )
            }
            className="college-nav-button"
          >
            {t("Next College")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="dataset-button-group mb-6">
        <button
          onClick={() => setActiveDataset("admissions")}
          className={`dataset-button ${activeDataset === "admissions" ? "active" : ""}`}
          data-type="admissions"
        >
          {t("Admission Rates")}
        </button>
        <button
          onClick={() => setActiveDataset("cost")}
          className={`dataset-button ${activeDataset === "cost" ? "active" : ""}`}
          data-type="cost"
        >
          {t("Cost of Attendance")}
        </button>
        <button
          onClick={() => setActiveDataset("outcomes")}
          className={`dataset-button ${activeDataset === "outcomes" ? "active" : ""}`}
          data-type="outcomes"
        >
          {t("Student Outcomes")}
        </button>
        <button
          onClick={() => setActiveDataset("faculty")}
          className={`dataset-button ${activeDataset === "faculty" ? "active" : ""}`}
          data-type="faculty"
        >
          {t("Faculty Ratios")}
        </button>
        <button
          onClick={() => setActiveDataset("demographics")}
          className={`dataset-button ${activeDataset === "demographics" ? "active" : ""}`}
          data-type="demographics"
        >
          {t("Demographics & Diversity")}
        </button>
      </div>

      <div className="dashboard-container">
        <div className="component-container flex-[2] min-w-0">
          {activeDataset === "admissions" && renderAdmissionsChart()}
          {activeDataset === "cost" && renderCostChart()}
          {activeDataset === "outcomes" && renderOutcomesCharts()}
          {activeDataset === "faculty" && renderFacultyRatiosChart()}
          {activeDataset === "demographics" && renderDemographicsChart()}
        </div>

        <div className="filter-container w-64">
          <h3>{t("Filter by")}</h3>
          <div className="filter-options">
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`filter-option ${activeCategory === category ? "active" : ""}`}
              >
                <span className="indicator"></span>
                {t(category)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}