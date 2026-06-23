import pytest

from codebase_qa.chunking import chunk_file


def test_chunk_file_not_yet_implemented(tmp_path):
    f = tmp_path / "sample.py"
    f.write_text("def foo(): pass\n")
    with pytest.raises(NotImplementedError):
        chunk_file(f)
