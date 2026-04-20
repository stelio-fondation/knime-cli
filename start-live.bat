@echo off
start "KNIME Live" node %~dp0dist\index.js live -w wf_simple -p "%~dp0samples"
