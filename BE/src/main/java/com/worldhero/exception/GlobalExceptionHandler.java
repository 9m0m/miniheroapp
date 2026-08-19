package com.worldhero.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidWorldProofException.class)
    public ResponseEntity<ErrorResponse> handleInvalidWorldProof(InvalidWorldProofException ex, HttpServletRequest request) {
        log.warn("🛡️ World ID Proof Rejected: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", "INVALID_WORLD_PROOF", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("🔍 Resource Not Found: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        String code = (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("user")) ? "USER_NOT_FOUND" : "RESOURCE_NOT_FOUND";
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", code, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(InsufficientResourceException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientResource(InsufficientResourceException ex, HttpServletRequest request) {
        log.warn("🪙 Insufficient Resources: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, "Insufficient Resources", "INSUFFICIENT_RESOURCE", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleIdempotencyConflict(IdempotencyConflictException ex, HttpServletRequest request) {
        log.warn("🔁 Idempotency Key Conflict: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.CONFLICT, "Conflict", "IDEMPOTENCY_KEY_CONFLICT", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(GameRuleViolationException.class)
    public ResponseEntity<ErrorResponse> handleGameRuleViolation(GameRuleViolationException ex, HttpServletRequest request) {
        log.warn("⚠️ Game Rule Violation: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, "Game Rule Violation", "GAME_RULE_VIOLATION", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("⚠️ Illegal Argument: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", "BAD_REQUEST", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        log.warn("⚠️ Illegal State: {} | URI: {}", ex.getMessage(), request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid State", "INVALID_STATE", ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMsg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.warn("📝 Validation Failed: {} | URI: {}", errorMsg, request.getRequestURI());
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation Error", "VALIDATION_ERROR", errorMsg, request.getRequestURI(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        log.warn("🚫 Access Denied | URI: {}", request.getRequestURI());
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", "ACCESS_DENIED", "Bạn không có quyền truy cập tài nguyên này.", request.getRequestURI(), null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        log.warn("🔒 Authentication Required | URI: {}", request.getRequestURI());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED", "Vui lòng xác thực tài khoản hoặc đăng nhập.", request.getRequestURI(), null);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLocking(OptimisticLockingFailureException ex, HttpServletRequest request) {
        log.warn("⚡ Optimistic Locking Conflict | URI: {}", request.getRequestURI());
        return buildResponse(HttpStatus.CONFLICT, "Conflict", "OPTIMISTIC_LOCK_CONFLICT", "Xung đột phiên làm việc do có thao tác đồng thời. Vui lòng tải lại và thử lại.", request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        log.error("💥 Unhandled Internal Server Error [TraceId: {}] | URI: {}", traceId, request.getRequestURI(), ex);
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "INTERNAL_SERVER_ERROR",
                "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng liên hệ hỗ trợ kèm mã: " + traceId,
                request.getRequestURI(),
                traceId
        );
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String error, String errorCode, String message, String path, String traceId) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .errorCode(errorCode)
                .message(message)
                .path(path)
                .traceId(traceId)
                .build();
        return ResponseEntity.status(status).body(response);
    }
}
