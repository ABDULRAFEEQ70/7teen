#!/bin/bash

echo "🎓 Takoradi Technical University Grade Manager - Build Script"
echo "============================================================="

# Check if dotnet is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 6.0 SDK first."
    echo ""
    echo "Installation instructions:"
    echo "- Windows: Download from https://dotnet.microsoft.com/download"
    echo "- macOS: brew install dotnet"
    echo "- Ubuntu/Debian: Follow instructions at https://docs.microsoft.com/en-us/dotnet/core/install/linux"
    echo ""
    exit 1
fi

# Display .NET version
echo "✅ .NET SDK detected:"
dotnet --version
echo ""

# Restore dependencies
echo "📦 Restoring NuGet packages..."
if dotnet restore; then
    echo "✅ Dependencies restored successfully"
else
    echo "❌ Failed to restore dependencies"
    exit 1
fi

echo ""

# Build the application
echo "🔨 Building application..."
if dotnet build --configuration Release; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🚀 Application built successfully!"
echo ""
echo "To run the application:"
echo "  dotnet run"
echo ""
echo "Or to run the compiled version:"
echo "  dotnet bin/Release/net6.0/TakoradiTechGradeManager.dll"
echo ""
echo "📚 See README.md for complete usage instructions"
echo "📋 See DEMO_OUTPUT.md for application demonstration"