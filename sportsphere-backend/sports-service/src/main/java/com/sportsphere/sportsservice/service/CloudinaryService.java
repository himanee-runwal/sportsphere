package com.sportsphere.sportsservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Uploads the file to Cloudinary.
     * @return a map containing details like "public_id" and "secure_url".
     */
    public Map uploadFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
        String publicId = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");

        Map params = ObjectUtils.asMap(
                "public_id", publicId,
                "overwrite", true,
                "resource_type", "auto"
        );

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        log.info("Uploaded file to Cloudinary with public_id: {}", publicId);
        return uploadResult;
    }

    /**
     * Deletes the file from Cloudinary using its public_id.
     */
    public void deleteFile(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return;
        }
        try {
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted Cloudinary file: {}. Result: {}", publicId, result.get("result"));
        } catch (IOException ex) {
            log.error("Failed to delete Cloudinary file {}: {}", publicId, ex.getMessage());
        }
    }
}
