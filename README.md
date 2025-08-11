# MCSchematic Converter

A web-based Minecraft schematic file converter that allows users to easily convert between different schematic formats through a user-friendly interface.

## 🎯 Overview

MCSchematic Converter is a Node.js web application that provides a simple and intuitive way to convert Minecraft schematic files between various popular formats. The application serves as a web interface wrapper around the powerful Java-based conversion engine.

## ✨ Supported Formats

Convert between the following Minecraft schematic formats:

- **`.nbt`** - Vanilla Minecraft Structures
- **`.bp`** - Axiom format
- **`.schem`** - WorldEdit/FAWE format  
- **`.litematic`** - Litematica mod format

## 🛠️ Technology Stack

- **Frontend**: Node.js 21+ web application
- **Backend Core**: Java-based conversion engine by [PiTheGuy](https://github.com/PiTheGuy/SchemConvert)
  
## 🚀 Features

- **Multi-format Support**: Convert between 4 popular Minecraft schematic formats
- **Web-based Interface**: No need to use command line tools
- **User-friendly**: Designed for regular users without technical expertise
- **Reliable Conversion**: Powered by proven Java conversion library

## 📋 Requirements

- Node.js 21 or higher
- Java Runtime Environment (for the conversion core)
- More than 500 MB for bigger uploaded files

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/PanHaskins/MCSchematic-Converter.git
cd MCSchematic-Converter
```

2. Install dependencies:
```bash
npm install package.json
```

3. Start the application:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000` (or your configured port in .env)

## 📖 Usage

1. Visit the web application in your browser
2. Upload your Minecraft schematic file
3. Select the desired output format
4. Click convert and download your converted file

## 🤖 AI Development Notice

This project was developed with assistance from AI tools:
- **GPT Codex** - Code generation and development assistance
- **Claude.ai** - Documentation and project structuring

## 🙏 Credits

This project is built upon the excellent work of [PiTheGuy's SchemConvert](https://github.com/PiTheGuy/SchemConvert), which provides the core conversion functionality. This web application simply makes that powerful tool accessible to regular users through a friendly web interface.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This is a web wrapper around the Java-based SchemConvert tool. All conversion logic credit goes to the original [SchemConvert project](https://github.com/PiTheGuy/SchemConvert).
