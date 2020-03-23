% PBPL Foosball ELO Rating System
% Written by Andrew Fisher
% August 2019

% THIS FUNCTION OPTIMIZES THE INITIAL RATINGS SUCH THAT THE CHANGE BETWEEN
% INITIAL AND FINAL RATINGS IS A MINIMUM. COULD BE BENEFICIAL IN SPEEDING
% UP CONVERGENCE OF THE RATING SYSTEM.

function Optimizer()

% Read In Logs
[GL,R,numplayers]=ReadCheckLog();
OR=readtable('Optimized Ratings.xlsx');

% Run Optimization
x0=OR{1,1:numplayers};
options=optimset('TolFun',2,'TolX',1);
fun=@(x) ErrorFcn(x,GL,R);
x=fminsearch(fun,x0,options);

% Save Results
OR{1,1:numplayers}=round(x);
writetable(OR,'Optimized Ratings.xlsx')

