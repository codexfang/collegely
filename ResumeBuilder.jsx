import React, { useState } from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: "#1f2937",
    backgroundColor: "#f8fafc",
  },
  section: {
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0ea5e9",
    marginBottom: 4,
  },
  contact: {
    fontSize: 11,
    color: "#555",
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    borderBottom: "1 solid #e2e8f0",
    paddingBottom: 3,
    color: "#1e293b",
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 4,
  },
});

function MyDocument({ data }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.name}>{data.name || "Your Name"}</Text>
          <Text style={styles.contact}>Email: {data.email || "your.email@example.com"}</Text>
          <Text style={styles.contact}>Phone: {data.phone || "123-456-7890"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Education</Text>
          <Text>{data.education || "High School Diploma, Graduation Year"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Activities & Experience</Text>
          {data.activities.length > 0 ? (
            data.activities.map((act, i) => (
              <Text key={i} style={styles.bullet}>• {act}</Text>
            ))
          ) : (
            <Text>No activities listed.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

export default function ResumeBuilder() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    activities: [],
    currentActivity: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const addActivity = () => {
    const trimmed = data.currentActivity.trim();
    if (trimmed !== "") {
      setData(prev => ({
        ...prev,
        activities: [...prev.activities, trimmed],
        currentActivity: "",
      }));
    }
  };

  return (
    <div className="component-container">
      <h2 className="component-title">Resume Builder</h2>

      <div className="space-y-4">
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="Email"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <textarea
            name="education"
            value={data.education}
            onChange={handleChange}
            placeholder="Education"
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Activities / Experience</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              name="currentActivity"
              value={data.currentActivity}
              onChange={handleChange}
              placeholder="Add activity or experience"
              className="form-input flex-grow"
            />
          </div>
          <ul className="activities-list">
            {data.activities.map((act, idx) => (
              <li key={idx}>{act}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <PDFDownloadLink
            document={<MyDocument data={data} />}
            fileName="resume.pdf"
            className="button button-primary button-block"
          >
            {({ loading }) => (
              loading ? "Generating PDF..." : "Download Resume"
            )}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}