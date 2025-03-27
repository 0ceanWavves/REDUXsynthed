@echo off
title Supabase MCP Server
echo Starting Supabase MCP Server...
cd /d C:\MCP\supabase-mcp-server
python -m supabase_mcp.main
echo MCP Server started in minimized window. You can close this window. 