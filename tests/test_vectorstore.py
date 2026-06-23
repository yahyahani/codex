import pytest

from codebase_qa.vectorstore import add_chunks, query


def test_add_chunks_not_yet_implemented():
    with pytest.raises(NotImplementedError):
        add_chunks("test", [], [])


def test_query_not_yet_implemented():
    with pytest.raises(NotImplementedError):
        query("test", [0.0])
