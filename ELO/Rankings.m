% PBPL Foosball ELO Rating System
% Written by Andrew Fisher
% August 2019

% THIS FUNCTION COMPILES GAME STATS FOR EACH PLAYER AND OUTPUTS THE 
% RANKINGS FOR A GIVEN DAY, ALONG WITH CHANGES IN PAST WEEK

function Rankings(GL,R,numplayers)
fileID='Results.xlsx';

%% Create Player Info Table
for i=1:numplayers
    name=R.Properties.VariableNames{i};
    if i==1
        stats=PlayerInfo(GL,R,name);
    else
    stats=[stats;PlayerInfo(GL,R,name)];
    end
end
stats.Properties.RowNames=R.Properties.VariableNames(1:numplayers);
writetable(stats,fileID,'Sheet','Stats');


%% Create Ranking Table
% Prompt for day to output rankings
prompt='Enter date for rankings in mm/dd/yyyy format: ';
str=input(prompt,'s');
ordinal=datenum(str,'mm/dd/yyyy');
pos=find(datenum(R.Date)==ordinal);

% Extract current and past ratings
Current=R{pos,1:numplayers};
WeekAgo=R{pos-7,1:numplayers};

% Keep track of how indices shift under sorting
[~,Iweek]=sort(WeekAgo,'descend');
[~,Icurrent]=sort(Current,'descend');

% Calculate items for ranking table
[Rank,Name,Rating,RankChange,RatingChange]=deal(cell(numplayers,1));
for i=1:numplayers
    Rank(i)=num2cell(i);
    Name(i)=cellstr(R.Properties.VariableNames{Icurrent(i)});
    Rating(i)=num2cell(R{pos,Icurrent(i)});
    RankChange(i)=num2cell(find(Iweek==Icurrent(i))-i);
    RatingChange(i)=num2cell(R{pos,Icurrent(i)}-R{pos-7,Icurrent(i)});
end
Rankings=table(Rank,Name,Rating,RankChange,RatingChange);
Date={str}; DateTable=table(Date);  % Include date of rankings

writetable(Rankings,fileID,'Sheet','Rankings');
writetable(DateTable,fileID,'Sheet','Rankings','Range','F1:F2');