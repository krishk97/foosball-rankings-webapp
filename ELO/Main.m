% PBPL Foosball ELO Rating System
% Written by Andrew Fisher
% August 2019

function Main()
close all;
clear vars;

%% Read In Logs
[GL,R,numplayers,error]=ReadCheckLog();
if error==1
    return;
end

%% Update Ratings
R=Simulate(GL,R);

%% Compute Rankings
Rankings(GL,R,numplayers);

%% Plot Ratings
PlotRatings(R,numplayers);

%% Save Backup of Foosball Log
fileID=strcat('Foosball Backup\\FoosballLogBackup_',datestr(datetime('today')),'.xlsx');
writetable(GL,fileID);