#!/usr/bin/env python3
"""
Health Insights Development Server Starter
This script helps you run both Django backend and Vite frontend development servers
"""

import subprocess
import sys
import time
import threading
import os
from pathlib import Path

def run_django():
    """Run Django development server"""
    print("🚀 Starting Django backend server on http://127.0.0.1:8000")
    try:
        subprocess.run([sys.executable, "manage.py", "runserver", "127.0.0.1:8000"], 
                      cwd=Path(__file__).parent / "backend", check=True)
    except KeyboardInterrupt:
        print("\n🛑 Django server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Django server failed: {e}")

def run_vite():
    """Run Vite development server"""
    print("⚡ Starting Vite frontend server on http://127.0.0.1:5173")
    try:
        subprocess.run(["npm", "run", "dev"], 
                      cwd=Path(__file__).parent, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Vite server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Vite server failed: {e}")

def main():
    """Main setup function"""
    print("🏥 Health Insights - Development Server Starter")
    print("=" * 50)
    
    choice = input("""
Choose your development setup:

1. Django only (serves built React app)
2. Django + Vite (hot reload for frontend development)
3. Build React and start Django

Enter your choice (1-3): """).strip()
    
    if choice == "1":
        print("\n📦 Starting Django with built React frontend...")
        run_django()
        
    elif choice == "2":
        print("\n🔥 Starting both Django and Vite servers...")
        print("Django API: http://127.0.0.1:8000")
        print("Vite Frontend: http://127.0.0.1:5173")
        print("\nPress Ctrl+C to stop both servers\n")
        
        # Start Django in a separate thread
        django_thread = threading.Thread(target=run_django, daemon=True)
        django_thread.start()
        
        # Give Django a moment to start
        time.sleep(3)
        
        # Start Vite (this will block until Ctrl+C)
        try:
            run_vite()
        except KeyboardInterrupt:
            print("\n🛑 Stopping all servers...")
            
    elif choice == "3":
        print("\n🔨 Building React frontend...")
        try:
            subprocess.run(["npm", "run", "build"], 
                          cwd=Path(__file__).parent, check=True)
            print("✅ React build completed!")
            print("\n🚀 Starting Django server...")
            run_django()
        except subprocess.CalledProcessError as e:
            print(f"❌ Build failed: {e}")
            
    else:
        print("❌ Invalid choice. Please run the script again.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
        sys.exit(0)