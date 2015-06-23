a = files('*jpg');
mkdir toobig
outdir = fullfile(pwd, 'toobig');
for i = 1:length(a)
    im = imread(a{i});
    d = size(im);
    if d(1)>500
        im = imresize(im, [500 NaN]); 
        movefile(a{i}, outdir);
        imwrite(im, a{i}); 
    end
    
end
    