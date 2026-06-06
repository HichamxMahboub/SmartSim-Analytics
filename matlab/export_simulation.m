% SmartSim Analytics - MATLAB/Simulink export example
% This script generates a synthetic control-system response and exports it
% as CSV. It can be adapted to real Simulink logged signals.

clear; clc;

time = (0:0.1:12)';
input = 100 * ones(size(time));
output = 100 * (1 - exp(-0.55 * time)) + 4 * sin(2.8 * time) .* exp(-0.12 * time);
temperature = 28 + 0.35 * time + 1.8 * sin(0.7 * time);
speed = output + 1.5 * sin(1.4 * time);

% Inject a few synthetic disturbances to demonstrate anomaly detection.
output(46) = output(46) + 22;
temperature(73) = temperature(73) + 9;
speed(92) = speed(92) - 18;

error = input - output;

data = table(time, input, output, error, temperature, speed);
writetable(data, "sample_simulink_output.csv");

disp("Exported sample_simulink_output.csv");

