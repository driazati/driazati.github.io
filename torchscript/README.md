# TorchScript Benchmarks

## Resnet50

<div id='basic'></div>


# Reproducing Results

* Use `Benchmark.cleanup()` liberally in your benchmark tests to do garbage collection and clear caches
* Disable chef with `$ stop_chef_temporarily`


# Adding a Benchmark

Benchmarks are written in a test file which is then run many times as a subprocess
of an orchestration script [`runner/main.py`](). **By default, the runner script
will uninstall PyTorch and torchvision (use `--skip-checkout` to disable)**. The
runner script relies on having a conda environment set up. You may want to add
one specifically for benchmarking

```bash
$ conda create --name benchmarking python=3.7
$ conda activate benchmarking
```

The runner script can be used as follows

```
$ python runner/main.py -h
usage: main.py [-h] [--skip-checkout] [--skip-conda-check] --out OUT
               [--hash HASH]

Run TorchScript benchmarks

optional arguments:
  -h, --help          show this help message and exit
  --skip-checkout     Don't remove existing PyTorch/Torchvision
  --skip-conda-check  Don't print the current conda environment
  --out OUT           Destination git repo to write JSONs to
  --hash HASH         PyTorch hash to use
```

If a PyTorch git hash is provided via `--hash`, the runner script will remove any
existing installs of PyTorch and torchvision, then check out
that commit and build it. This allows for easy backtesting of results,
for an example see [`examples/backtest.py`]().

If you are trying to test against some local changes to PyTorch, use the `--skip-checkout`
option to prevent the runner from uninstalling and building anything and skip straight
to running the benchmarks.

If `--out` is not provided, results will be printed to `stdout` instead of written to a
JSON file in the directory specified to `--out`. For an example see [`examples/backtest.py`]().

## Generate Results

1. Write your benchmark test in [`benchmarks/test.py`]().
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


<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.8/c3.css">
<link rel="stylesheet" href="styles.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.12.0/d3.js" charset="utf-8"></script>
<script src="https://d3js.org/d3-array.v2.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.8/c3.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@handsontable/jstat/dist/jstat.min.js"></script>
<script src='script.js'></script>
