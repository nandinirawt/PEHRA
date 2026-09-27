// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IntegrityLedger {
    enum RecordType {
        Review,
        SessionSummary
    }

    struct Record {
        bytes32 examId;
        bytes32 contentHash;
        bytes signature;
        uint256 timestamp;
        RecordType recordType;
    }

    mapping(bytes32 => bool) public examExists;
    mapping(bytes32 => Record) public records;
    mapping(bytes32 => bool) public examClosed;

    event ExamCreated(
        bytes32 indexed examId,
        uint256 timestamp
    );

    event RecordStored(
        bytes32 indexed recordId,
        bytes32 indexed examId,
        bytes32 contentHash,
        RecordType recordType,
        uint256 timestamp
    );

    event ExamClosed(
        bytes32 indexed examId,
        bytes32 indexed recordId,
        uint256 timestamp
    );

    function createExam(bytes32 examId) external {
        require(!examExists[examId], "Exam already exists");

        examExists[examId] = true;

        emit ExamCreated(examId, block.timestamp);
    }

    function recordEvent(
        bytes32 examId,
        bytes32 recordId,
        bytes32 contentHash,
        bytes calldata signature
    ) external {
        require(examExists[examId], "Exam does not exist");
        require(!examClosed[examId], "Exam already closed");
        require(records[recordId].timestamp == 0, "Record already exists");

        records[recordId] = Record({
            examId: examId,
            contentHash: contentHash,
            signature: signature,
            timestamp: block.timestamp,
            recordType: RecordType.Review
        });

        emit RecordStored(
            recordId,
            examId,
            contentHash,
            RecordType.Review,
            block.timestamp
        );
    }

    function recordReview(
        bytes32 examId,
        bytes32 recordId,
        bytes32 contentHash,
        bytes calldata signature
    ) external {
        require(examExists[examId], "Exam does not exist");
        require(!examClosed[examId], "Exam already closed");
        require(records[recordId].timestamp == 0, "Record already exists");

        records[recordId] = Record({
            examId: examId,
            contentHash: contentHash,
            signature: signature,
            timestamp: block.timestamp,
            recordType: RecordType.Review
        });

        emit RecordStored(
            recordId,
            examId,
            contentHash,
            RecordType.Review,
            block.timestamp
        );
    }

    function closeExam(
        bytes32 examId,
        bytes32 recordId,
        bytes32 contentHash,
        bytes calldata signature
    ) external {
        require(examExists[examId], "Exam does not exist");
        require(!examClosed[examId], "Exam already closed");
        require(records[recordId].timestamp == 0, "Record already exists");

        records[recordId] = Record({
            examId: examId,
            contentHash: contentHash,
            signature: signature,
            timestamp: block.timestamp,
            recordType: RecordType.SessionSummary
        });

        examClosed[examId] = true;

        emit RecordStored(
            recordId,
            examId,
            contentHash,
            RecordType.SessionSummary,
            block.timestamp
        );

        emit ExamClosed(
            examId,
            recordId,
            block.timestamp
        );
    }

    function verifyEvent(
        bytes32 recordId,
        bytes32 expectedHash
    ) external view returns (bool) {
        require(records[recordId].timestamp != 0, "Record does not exist");

        return records[recordId].contentHash == expectedHash;
    }
}
