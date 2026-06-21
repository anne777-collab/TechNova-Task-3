# 🚀 TechNova - Task 3

A modern, responsive multi-page web application built using **HTML5, CSS3, and Vanilla JavaScript** as part of the internship program. This project extends the previous TechNova website by integrating real-world JavaScript functionality, including a live Weather Dashboard powered by the OpenWeather API and a fully functional Todo Manager with Local Storage support.

---

## 📌 Project Overview

TechNova is a responsive technology website designed to demonstrate practical front-end development skills. In **Task 3**, the project focuses on implementing advanced JavaScript concepts such as API integration, Local Storage, DOM manipulation, modular JavaScript, and interactive UI components.

The application provides users with live weather information, a task management system, interactive product previews, and a clean responsive interface.

---

## ✨ Features

### 🌤️ Weather Dashboard

* Search weather by city name
* Live weather data using OpenWeather API
* Current temperature
* Feels like temperature
* Humidity
* Wind speed
* Atmospheric pressure
* Visibility
* Sunrise & Sunset (city local time)
* Weather description
* Weather icon
* Input validation
* Responsive weather interface

---

### ✅ Todo Manager

* Add new tasks
* Mark tasks as completed
* Edit existing tasks
* Delete individual tasks
* Search tasks instantly
* Filter:

  * All
  * Active
  * Completed
* Mark all tasks as completed
* Clear completed tasks
* Automatic progress tracking
* Data saved using Local Storage

---

### 🛍️ Product Experience

* Interactive product cards
* Product quick-view modal
* Responsive product layout
* Smooth animations

---

### 🎨 User Interface

* Fully responsive layout
* Dark & Light mode support
* Mobile-first design
* Smooth transitions
* Modern card-based UI
* Reusable JavaScript modules

---

## 🛠️ Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript (ES6 Modules)
* OpenWeather API
* Local Storage API

---

## 📂 Project Structure

```text
TechNova/
│
├── css/
│   ├── style.css
│   ├── weather.css
│   └── todo.css
│
├── images/
│
├── js/
│   ├── main.js
│   ├── weather.js
│   ├── todo.js
│   ├── storage.js
│   ├── modal.js
│   ├── navigation.js
│   ├── slider.js
│   ├── theme.js
│   ├── validation.js
│   ├── config.example.js
│   └── config.js (ignored)
│
├── index.html
├── about.html
├── products.html
├── weather.html
├── todo.html
├── contact.html
└── README.md
```

---

## 🔑 Weather API Setup

This project uses the **OpenWeather API**.

Create a file named:

```text
js/config.js
```

Add your API key:

```javascript
export const OPENWEATHER_API_KEY = "YOUR_API_KEY";
```

An example configuration file is already included:

```text
js/config.example.js
```

---

## ▶️ Running the Project

1. Clone the repository

```bash
git clone <repository-url>
```

2. Open the project folder.

3. Create:

```text
js/config.js
```

4. Add your OpenWeather API key.

5. Launch the project using **Live Server** in VS Code.

---

## 📱 Responsive Design

The application has been optimized for:

* Desktop
* Laptop
* Tablet
* Mobile Devices

---

## 🎯 Task 3 Objectives Completed

* Responsive web pages
* JavaScript modules
* DOM manipulation
* Event handling
* Weather API integration
* Local Storage implementation
* Todo Manager
* Product quick-view modal
* Form validation
* Interactive UI components
* Modern responsive design

---

## 🔒 Security

The OpenWeather API key is **not committed** to GitHub.

* `config.js` is ignored using `.gitignore`
* `config.example.js` is provided as a template for setup

---

## 👨‍💻 Author

**Sahil**

Internship Project – Task 3

Built with ❤️ using HTML, CSS, and JavaScript.
