# TorchScript Benchmarks

## Resnet50


<div id='basic'></div>


# Reproducing Results

1. Disable `chef`


# Adding a Benchmark

## Generate Results

1. Write your benchmark test in [`test.py`]().
2. Use the [`runner.py`]() to run the test and generate results. These will be saved to a `.json` file and `git push`ed to the `driazati.github.io/torchscript/data` folder.

## Display Results

1. Add your test to the [`README.md`](https://github.com/driazati/driazati.github.io/blob/master/torchscript/README.md) as a `<div>`.
2. Add code to generate your chart in [`script.js`](https://github.com/driazati/driazati.github.io/blob/master/torchscript/script.js).

    This should look something like:

    ```javascript
    make_chart({
        name: 'resnet50',
        id: 'resnet50_var',
        rollup: (column_name, d) => d3.variance(d, x => x[column_name]),
        xlabel: 'Commit Time',
        ylabel: 'Milliseconds',
        title: 'Resnet50 (variance of 10 runs)'
    });
    ```

3. Run the `pandoc` make from the `driazati.github.io/torchscript` directory:

    ```bash
    make
    ```

4. View the changes by running `python -m http.server` and going to `localhost:8000` in your browser.

5. `git push` the changes