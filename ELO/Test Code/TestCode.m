% Randomly pick the four players
clearvars;
R=readtable('Initial Ratings.xlsx');
npoints=300;
format='mm/dd/yyyy';
data=array2table(zeros(0,6));
data.Properties.VariableNames={'A','B','C','D','Score','Date'};

for i=1:npoints
    Rand=randsample(['A','B','C','D'],4);
    WRating=(R{1,{Rand(1)}}+R{1,{Rand(2)}})/2;
    LRating=(R{1,{Rand(3)}}+R{1,{Rand(4)}})/2;
    Diff=WRating-LRating;
    EW=1/(1+10^(-Diff/400));
    EW=EW+normrnd(0,.15);
    if EW<0
        EW=0;
    elseif EW>1
        EW=1;
    end

    if EW>0.5
        score=10/EW-10;
        vec={Rand(1), Rand(2), Rand(3), Rand(4), score, datestr(i+700000,format)};
    else 
        score=10/(1-EW)-10;
        vec={Rand(3), Rand(4), Rand(1), Rand(2), score, datestr(i+700000,format)};
    end
    
    data=[data; array2table(vec,'VariableNames',data.Properties.VariableNames)];
end


writetable(data,'Test.xlsx');